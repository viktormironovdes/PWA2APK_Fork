
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// serve static files
app.use(express.static('.'));

// Game state
let gameState = {
  players: new Map(),
  globalEvents: [],
  villainInvasions: [],
  dailyQuests: [
    { id: 1, title: "Pet 500 cats", description: "Click 500 times", target: 500, reward: "Catnip Boost", progress: 0 },
    { id: 2, title: "Fish Collector", description: "Collect 10,000 fish", target: 10000, reward: "Golden Fish", progress: 0 },
    { id: 3, title: "Helper Master", description: "Buy 20 helpers", target: 20, reward: "Helper Boost", progress: 0 }
  ],
  leaderboard: []
};

// Player class
class Player {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.fish = 0;
    this.fishPerSecond = 0;
    this.totalClicks = 0;
    this.powerLevel = 1;
    this.evolutionLevel = 0;
    this.purrCrystals = 0;
    this.comboMeter = 0;
    this.lastClickTime = 0;
    this.catSkin = 'default';
    this.unlockedSkins = ['default'];
    this.loreEntries = [];
    this.achievements = [];
    this.dailyQuestProgress = new Map();
    this.helpers = {
      cursor: 0, yarn: 0, robo: 0, wizard: 0, portal: 0, dragon: 0
    };
    this.costs = {
      cursor: 10, yarn: 50, robo: 200, wizard: 1000, portal: 5000, dragon: 25000
    };
  }

  click() {
    const now = Date.now();
    const timeDiff = now - this.lastClickTime;
    
    this.fish += 1;
    this.totalClicks += 1;
    
    // Combo system
    if (timeDiff < 500) { // Fast clicking
      this.comboMeter = Math.min(this.comboMeter + 1, 100);
    } else {
      this.comboMeter = Math.max(this.comboMeter - 2, 0);
    }
    
    this.lastClickTime = now;
    
    // Check for cat frenzy
    if (this.comboMeter >= 100) {
      this.triggerCatFrenzy();
    }
    
    this.updateEvolution();
    this.updatePowerLevel();
  }

  triggerCatFrenzy() {
    this.comboMeter = 0;
    // Auto-click storm for 10 seconds
    const autoClickInterval = setInterval(() => {
      this.fish += 5;
    }, 100);
    
    setTimeout(() => {
      clearInterval(autoClickInterval);
    }, 10000);
    
    return { type: 'catFrenzy', duration: 10000 };
  }

  updateEvolution() {
    const newEvolutionLevel = Math.floor(this.powerLevel / 10);
    if (newEvolutionLevel > this.evolutionLevel) {
      this.evolutionLevel = newEvolutionLevel;
      this.unlockLoreEntry();
      return { evolved: true, level: this.evolutionLevel };
    }
    return { evolved: false };
  }

  updatePowerLevel() {
    const newPowerLevel = Math.min(Math.floor(this.totalClicks / 100) + Math.floor(this.fishPerSecond / 50) + 1, 100);
    if (newPowerLevel > this.powerLevel) {
      this.powerLevel = newPowerLevel;
      return { levelUp: true, level: this.powerLevel };
    }
    return { levelUp: false };
  }

  unlockLoreEntry() {
    const loreEntries = [
      "The first purr echoes through dimensions...",
      "Ancient cat scrolls reveal the Fish Prophecy...",
      "The Great Cat Sphinx awakens from eternal slumber...",
      "Rainbow bridges connect all cat kingdoms...",
      "The Void Cats whisper secrets of infinite treats...",
      "Cosmic yarn balls spin the fabric of reality...",
      "The Cat Goddess bestows her eternal blessing...",
      "You have glimpsed the true form of Whiskers..."
    ];
    
    if (this.evolutionLevel < loreEntries.length && !this.loreEntries.includes(this.evolutionLevel)) {
      this.loreEntries.push(this.evolutionLevel);
      return loreEntries[this.evolutionLevel];
    }
    return null;
  }

  prestige() {
    if (this.fish < 1000000) return false;
    
    const crystalsEarned = Math.floor(this.fish / 100000);
    this.purrCrystals += crystalsEarned;
    
    // Reset progress
    this.fish = 0;
    this.fishPerSecond = 0;
    this.totalClicks = 0;
    this.powerLevel = 1;
    this.helpers = { cursor: 0, yarn: 0, robo: 0, wizard: 0, portal: 0, dragon: 0 };
    this.costs = { cursor: 10, yarn: 50, robo: 200, wizard: 1000, portal: 5000, dragon: 25000 };
    
    return { success: true, crystals: crystalsEarned };
  }
}

// Socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinGame', (username) => {
    const player = new Player(socket.id, username || `Player${socket.id.slice(0, 6)}`);
    gameState.players.set(socket.id, player);
    
    socket.emit('gameState', {
      player: player,
      leaderboard: getLeaderboard(),
      dailyQuests: gameState.dailyQuests
    });
    
    socket.broadcast.emit('playerJoined', { username: player.username });
  });
  
  socket.on('click', () => {
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    const result = player.click();
    
    socket.emit('clickResult', {
      player: player,
      special: result
    });
    
    updateLeaderboard();
    io.emit('leaderboardUpdate', getLeaderboard());
  });
  
  socket.on('buyHelper', (helperType) => {
    const player = gameState.players.get(socket.id);
    if (!player || !player.helpers.hasOwnProperty(helperType)) return;
    
    const cost = player.costs[helperType];
    if (player.fish >= cost) {
      player.fish -= cost;
      player.helpers[helperType]++;
      
      // Update FPS based on helper type
      const fps = {
        cursor: 1, yarn: 3, robo: 15, wizard: 50, portal: 200, dragon: 1000
      };
      player.fishPerSecond += fps[helperType];
      
      // Increase cost
      player.costs[helperType] = Math.floor(cost * 1.25);
      
      socket.emit('helperPurchased', { player: player });
    }
  });
  
  socket.on('prestige', () => {
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    const result = player.prestige();
    socket.emit('prestigeResult', result);
  });
  
  socket.on('defendAgainstVillain', (clicks) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    const invasionIndex = gameState.villainInvasions.findIndex(v => v.targetId === socket.id);
    if (invasionIndex === -1) return;
    
    const invasion = gameState.villainInvasions[invasionIndex];
    invasion.defenseClicks += clicks;
    
    if (invasion.defenseClicks >= invasion.requiredClicks) {
      // Player successfully defended
      const reward = Math.floor(invasion.stolenFish * 1.5);
      player.fish += reward;
      
      socket.emit('villainDefeated', { reward: reward });
      gameState.villainInvasions.splice(invasionIndex, 1);
    }
  });
  
  socket.on('secretClick', (location) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;
    
    // Secret clickables
    const secrets = {
      'corner': { reward: 1000, skin: 'shadow' },
      'logo': { reward: 5000, skin: 'golden' },
      'background': { reward: 10000, skin: 'rainbow' }
    };
    
    if (secrets[location]) {
      player.fish += secrets[location].reward;
      if (!player.unlockedSkins.includes(secrets[location].skin)) {
        player.unlockedSkins.push(secrets[location].skin);
        socket.emit('skinUnlocked', secrets[location].skin);
      }
    }
  });
  
  socket.on('disconnect', () => {
    gameState.players.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// Game loop for passive income and events
setInterval(() => {
  gameState.players.forEach((player) => {
    player.fish += player.fishPerSecond / 10;
  });
  
  // Random villain invasions
  if (Math.random() < 0.01 && gameState.players.size > 0) {
    const players = Array.from(gameState.players.values());
    const targetPlayer = players[Math.floor(Math.random() * players.length)];
    
    const invasion = {
      targetId: targetPlayer.id,
      stolenFish: Math.floor(targetPlayer.fish * 0.1),
      requiredClicks: 50 + Math.floor(Math.random() * 50),
      defenseClicks: 0,
      timeLeft: 30000
    };
    
    gameState.villainInvasions.push(invasion);
    io.to(targetPlayer.id).emit('villainInvasion', invasion);
    
    setTimeout(() => {
      const index = gameState.villainInvasions.findIndex(v => v.targetId === targetPlayer.id);
      if (index !== -1) {
        targetPlayer.fish -= invasion.stolenFish;
        gameState.villainInvasions.splice(index, 1);
        io.to(targetPlayer.id).emit('villainSuccess', { stolen: invasion.stolenFish });
      }
    }, invasion.timeLeft);
  }
}, 100);

function updateLeaderboard() {
  const players = Array.from(gameState.players.values())
    .sort((a, b) => b.fish - a.fish)
    .slice(0, 10);
  
  gameState.leaderboard = players.map((p, index) => ({
    rank: index + 1,
    username: p.username,
    fish: Math.floor(p.fish),
    powerLevel: p.powerLevel
  }));
}

function getLeaderboard() {
  return gameState.leaderboard;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
