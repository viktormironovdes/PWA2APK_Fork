
// Adventure Mode Variables
let adventureMode = false;
let adventureStage = 0;
let adventureFriends = [];
let defeatedMonsters = 0;
let isInBattle = false;
let currentMonster = null;
let playerHealth = 100;
let monsterHealth = 100;
let battleClicks = 0;
let isEndingPlaying = false;

const adventureStages = [
  { name: "Forest of Whiskers", desc: "Begin your journey through the mystical forest", monster: "Shadow Wolf", friend: "Luna the Brave Cat" },
  { name: "Crystal Caves", desc: "Navigate through sparkling crystal formations", monster: "Crystal Spider", friend: "Rocky the Mining Cat" },
  { name: "Windy Mountains", desc: "Climb the treacherous mountain paths", monster: "Wind Serpent", friend: "Sky the Flying Cat" },
  { name: "Dark Swamp", desc: "Cross the mysterious swamplands", monster: "Swamp Beast", friend: "Marsh the Wise Cat" },
  { name: "Castle Gates", desc: "Approach the villain's fortress", monster: "Gate Guardian", friend: null },
  { name: "Throne Room", desc: "Face the villain in final battle!", monster: "Evil Overlord Cat", friend: null }
];

const monsters = {
  "Shadow Wolf": { health: 50, attack: 10, emoji: "🐺", weakness: "Fast clicking" },
  "Crystal Spider": { health: 75, attack: 15, emoji: "🕷️", weakness: "Consistent rhythm" },
  "Wind Serpent": { health: 100, attack: 20, emoji: "🐍", weakness: "Burst clicking" },
  "Swamp Beast": { health: 125, attack: 25, emoji: "👹", weakness: "Patience and timing" },
  "Gate Guardian": { health: 150, attack: 30, emoji: "🛡️", weakness: "Overwhelming force" },
  "Evil Overlord Cat": { health: 200, attack: 35, emoji: "😈🐱", weakness: "Pure determination" }
};

const friends = {
  "Luna the Brave Cat": { emoji: "🌙🐱", dialogue: ["Hello brave warrior! I sense great power in you.", "The path ahead is dangerous, but together we can overcome any obstacle!", "Press E to talk to me anytime during your journey."] },
  "Rocky the Mining Cat": { emoji: "⛏️🐱", dialogue: ["Welcome to my crystal caves!", "These crystals hold ancient power - they will aid you in battle.", "I've been mining here for years, waiting for a hero like you!"] },
  "Sky the Flying Cat": { emoji: "🪶🐱", dialogue: ["The winds carry news of your brave deeds!", "From up here, I can see the villain's castle growing darker.", "You're getting close to the final battle!"] },
  "Marsh the Wise Cat": { emoji: "🧙‍♂️🐱", dialogue: ["Young one, you have come far...", "The ancient prophecy speaks of one who will restore peace.", "I believe that hero is you. Take my blessing!"] }
};

function startAdventure() {
  if (powerLevel < 5) {
    showNotification('You need to reach Power Level 5 to start the adventure!', 'error');
    return;
  }
  
  adventureMode = true;
  adventureStage = 0;
  adventureFriends = [];
  defeatedMonsters = 0;
  playerHealth = 100;
  
  // Create adventure container if it doesn't exist
  if (!document.getElementById('adventureContainer')) {
    createAdventureContainer();
  }
  
  showScreen('adventure');
  updateAdventureDisplay();
  showNotification('🗺️ Adventure begins! Your journey to save the Cat Kingdom starts now!', 'success');
}

function createAdventureContainer() {
  const adventureHTML = `
    <div class="container" id="adventureContainer" style="display: none;">
      <h1>🏰 Journey to the Cat Kingdom</h1>
      
      <div id="adventureStats" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin: 20px;">
        <div>🗺️ Current Location: <span id="currentLocation">Starting Point</span></div>
        <div>❤️ Health: <span id="playerHealthDisplay">100</span>/100</div>
        <div>⚔️ Monsters Defeated: <span id="monstersDefeated">0</span></div>
        <div>👥 Friends Met: <span id="friendsCount">0</span></div>
        <div>🏆 Adventure Progress: <span id="adventureProgress">0</span>%</div>
      </div>

      <div id="adventureMain" style="text-align: center; margin: 30px;">
        <div id="adventureScene" style="font-size: 8em; margin: 20px;">🌲</div>
        <div id="adventureDescription" style="font-size: 1.2em; margin: 20px; color: #f0f0f0;">
          Your adventure begins in the mystical Forest of Whiskers...
        </div>
        <button id="adventureButton" onclick="proceedAdventure()" class="nav-btn" style="font-size: 1.2em; padding: 15px 30px;">
          🚀 Begin Journey
        </button>
      </div>

      <div id="friendsPanel" style="display: none; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin: 20px;">
        <h3>👥 Friends You've Met</h3>
        <div id="friendsList"></div>
        <p style="font-size: 0.9em; color: #ccc;">Press 'E' to talk to friends during your journey!</p>
      </div>

      <div id="battleScreen" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 3000; justify-content: center; align-items: center; flex-direction: column;">
        <h2 style="color: #ff6b6b;">⚔️ BATTLE! ⚔️</h2>
        <div id="battleArea" style="display: flex; justify-content: space-around; width: 80%; margin: 30px;">
          <div id="playerBattle" style="text-align: center;">
            <div style="font-size: 4em;">🐱</div>
            <div>You</div>
            <div>❤️ <span id="battlePlayerHealth">100</span>/100</div>
          </div>
          <div style="font-size: 3em; display: flex; align-items: center;">⚔️</div>
          <div id="monsterBattle" style="text-align: center;">
            <div id="monsterEmoji" style="font-size: 4em;">👹</div>
            <div id="monsterName">Monster</div>
            <div>❤️ <span id="battleMonsterHealth">100</span>/100</div>
          </div>
        </div>
        <div id="battleInfo" style="margin: 20px; text-align: center;">
          <p id="battleTip">Click rapidly to attack!</p>
          <p>Clicks this battle: <span id="battleClickCount">0</span></p>
        </div>
        <button id="battleClickButton" onclick="battleClick()" style="padding: 20px 40px; font-size: 1.5em; background: #ff6b6b; border: none; border-radius: 10px; color: white; cursor: pointer;">
          ⚔️ ATTACK!
        </button>
      </div>

      <div id="endingCredits" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); z-index: 4000; overflow: hidden;">
        <div id="creditsText" style="position: absolute; bottom: -200vh; left: 50%; transform: translateX(-50%); text-align: center; color: white; font-size: 1.2em; line-height: 2; width: 80%;">
          <h1 style="font-size: 3em; margin-bottom: 50px;">🏆 VICTORY! 🏆</h1>
          <p style="margin: 30px 0;">You have saved the Cat Kingdom!</p>
          <p style="margin: 30px 0;">The evil has been vanquished and peace restored!</p>
          <h2 style="margin: 50px 0;">🎬 Credits</h2>
          <p style="margin: 20px 0;"><strong>Hero:</strong> You, the Ultimate Cat Clicker Champion</p>
          <p style="margin: 20px 0;"><strong>Friends:</strong> Luna, Rocky, Sky, and Marsh</p>
          <p style="margin: 20px 0;"><strong>Game Design:</strong> The Ultimate Cat Clicker Team</p>
          <p style="margin: 20px 0;"><strong>Special Thanks:</strong> All the cats who believed in you</p>
          <p style="margin: 50px 0;"><strong>Monsters Defeated:</strong> <span id="finalMonsterCount">0</span></p>
          <p style="margin: 20px 0;"><strong>Friends Made:</strong> <span id="finalFriendCount">0</span></p>
          <p style="margin: 20px 0;"><strong>Total Adventure Clicks:</strong> <span id="finalAdventureClicks">0</span></p>
          <div style="margin-top: 100px; padding: 30px; background: rgba(255,255,255,0.1); border-radius: 15px;">
            <p style="font-size: 1.1em; color: #4ecdc4;"><strong>Thank you for playing, I hope you enjoyed.</strong></p>
            <p style="font-size: 1.1em; color: #4ecdc4;"><strong>You did it while the ride lasted.</strong></p>
            <p style="font-size: 1.3em; color: #ff6b6b; margin-top: 20px;"><strong>🎮 Ultimate Cat Clicker 2 coming soon... 🎮</strong></p>
          </div>
        </div>
      </div>

      <button class="nav-btn" onclick="showScreen('game')" style="margin: 20px;">🏠 Back to Main Game</button>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', adventureHTML);
}

function proceedAdventure() {
  if (adventureStage >= adventureStages.length) {
    showNotification('🏆 Adventure Complete! You are the true hero!', 'success');
    return;
  }

  const stage = adventureStages[adventureStage];
  
  if (stage.friend && !adventureFriends.includes(stage.friend)) {
    meetFriend(stage.friend);
  } else if (stage.monster) {
    startBattle(stage.monster);
  } else {
    adventureStage++;
    updateAdventureDisplay();
  }
}

function meetFriend(friendName) {
  adventureFriends.push(friendName);
  const friend = friends[friendName];
  
  showNotification(`👋 You met ${friendName}! Press E to talk to them.`, 'success');
  
  const dialogueDiv = document.createElement('div');
  dialogueDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9); color: white; padding: 30px; border-radius: 15px;
    z-index: 3500; text-align: center; max-width: 500px;
  `;
  
  dialogueDiv.innerHTML = `
    <div style="font-size: 3em; margin-bottom: 15px;">${friend.emoji}</div>
    <h3>${friendName}</h3>
    <p style="margin: 15px 0;">${friend.dialogue[0]}</p>
    <button onclick="this.parentElement.remove(); proceedAdventure();" class="nav-btn">Continue Journey</button>
  `;
  
  document.body.appendChild(dialogueDiv);
  updateFriendsList();
}

function startBattle(monsterName) {
  isInBattle = true;
  currentMonster = monsters[monsterName];
  monsterHealth = currentMonster.health;
  battleClicks = 0;
  
  document.getElementById('battleScreen').style.display = 'flex';
  document.getElementById('monsterEmoji').textContent = currentMonster.emoji;
  document.getElementById('monsterName').textContent = monsterName;
  document.getElementById('battleTip').textContent = `Weakness: ${currentMonster.weakness}`;
  
  updateBattleDisplay();
}

function battleClick() {
  if (!isInBattle) return;
  
  battleClicks++;
  
  // Player attacks
  const damage = Math.floor(Math.random() * 15) + 10;
  monsterHealth = Math.max(0, monsterHealth - damage);
  
  // Monster counter-attacks (if alive)
  if (monsterHealth > 0 && battleClicks % 3 === 0) {
    const monsterDamage = Math.floor(Math.random() * currentMonster.attack) + 5;
    playerHealth = Math.max(0, playerHealth - monsterDamage);
  }
  
  updateBattleDisplay();
  
  // Check battle end
  if (monsterHealth <= 0) {
    // Victory!
    isInBattle = false;
    defeatedMonsters++;
    document.getElementById('battleScreen').style.display = 'none';
    
    if (adventureStage === adventureStages.length - 1) {
      defeatFinalBoss();
    } else {
      showNotification('🏆 Monster defeated! Continue your journey!', 'success');
      adventureStage++;
      updateAdventureDisplay();
    }
  } else if (playerHealth <= 0) {
    // Defeat
    isInBattle = false;
    document.getElementById('battleScreen').style.display = 'none';
    playerHealth = 100; // Restore health
    showNotification('💔 Defeated! But your friends heal you. Try again!', 'error');
  }
}

function defeatFinalBoss() {
  const rulerDiv = document.createElement('div');
  rulerDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: linear-gradient(45deg, #4ecdc4, #44a08d); color: white; padding: 40px;
    border-radius: 20px; z-index: 4500; text-align: center; max-width: 600px;
    border: 3px solid gold;
  `;
  
  rulerDiv.innerHTML = `
    <div style="font-size: 4em; margin-bottom: 20px;">👑🐱</div>
    <h2>The True Ruler Returns!</h2>
    <p style="margin: 20px 0; font-size: 1.1em;">
      "Brave hero, you have saved our kingdom! The evil that corrupted our lands has been vanquished.
      Peace and prosperity shall return to all cats across the realm. You will forever be remembered 
      as the greatest Cat Champion in history!"
    </p>
    <p style="margin: 20px 0; font-style: italic;">
      "The Cat Kingdom is eternally grateful. Let the celebrations begin!"
    </p>
    <button onclick="startEndingCredits(); this.parentElement.remove();" class="nav-btn" style="font-size: 1.2em; padding: 15px 30px;">
      🎉 Accept Royal Thanks
    </button>
  `;
  
  document.body.appendChild(rulerDiv);
}

function startEndingCredits() {
  document.getElementById('endingCredits').style.display = 'block';
  
  document.getElementById('finalMonsterCount').textContent = defeatedMonsters;
  document.getElementById('finalFriendCount').textContent = adventureFriends.length;
  document.getElementById('finalAdventureClicks').textContent = battleClicks;
  
  const creditsText = document.getElementById('creditsText');
  creditsText.style.animation = 'creditsRoll 60s linear forwards';
  
  if (!document.getElementById('creditsStyle')) {
    const style = document.createElement('style');
    style.id = 'creditsStyle';
    style.textContent = `
      @keyframes creditsRoll {
        from { bottom: -200vh; }
        to { bottom: 100vh; }
      }
    `;
    document.head.appendChild(style);
  }
  
  isEndingPlaying = true;
  
  setTimeout(() => {
    document.getElementById('endingCredits').style.display = 'none';
    showScreen('game');
    showNotification('🏆 Adventure Complete! You are now a legend!', 'success');
    isEndingPlaying = false;
  }, 65000);
}

function updateAdventureDisplay() {
  if (adventureStage >= adventureStages.length) return;
  
  const stage = adventureStages[adventureStage];
  const progress = Math.floor((adventureStage / adventureStages.length) * 100);
  
  document.getElementById('currentLocation').textContent = stage.name;
  document.getElementById('playerHealthDisplay').textContent = playerHealth;
  document.getElementById('monstersDefeated').textContent = defeatedMonsters;
  document.getElementById('friendsCount').textContent = adventureFriends.length;
  document.getElementById('adventureProgress').textContent = progress;
  
  const sceneEmojis = ['🌲', '💎', '🏔️', '🌿', '🏰', '👑'];
  document.getElementById('adventureScene').textContent = sceneEmojis[adventureStage] || '🌲';
  document.getElementById('adventureDescription').textContent = stage.desc;
  
  const button = document.getElementById('adventureButton');
  if (stage.friend && !adventureFriends.includes(stage.friend)) {
    button.textContent = `👋 Meet ${stage.friend}`;
  } else if (stage.monster) {
    button.textContent = `⚔️ Fight ${stage.monster}`;
  } else {
    button.textContent = '🚀 Continue Journey';
  }
  
  if (adventureFriends.length > 0) {
    document.getElementById('friendsPanel').style.display = 'block';
  }
}

function updateBattleDisplay() {
  document.getElementById('battlePlayerHealth').textContent = playerHealth;
  document.getElementById('battleMonsterHealth').textContent = monsterHealth;
  document.getElementById('battleClickCount').textContent = battleClicks;
}

function updateFriendsList() {
  const friendsList = document.getElementById('friendsList');
  friendsList.innerHTML = '';
  
  adventureFriends.forEach(friendName => {
    const friend = friends[friendName];
    const friendDiv = document.createElement('div');
    friendDiv.style.cssText = `
      display: inline-block; margin: 10px; padding: 15px; background: rgba(255,255,255,0.1);
      border-radius: 10px; cursor: pointer; transition: all 0.3s ease;
    `;
    friendDiv.innerHTML = `
      <div style="font-size: 2em;">${friend.emoji}</div>
      <div style="font-size: 0.9em;">${friendName}</div>
    `;
    friendDiv.onclick = () => talkToFriend(friendName);
    friendsList.appendChild(friendDiv);
  });
}

function talkToFriend(friendName) {
  const friend = friends[friendName];
  const randomDialogue = friend.dialogue[Math.floor(Math.random() * friend.dialogue.length)];
  
  showNotification(`${friend.emoji} ${friendName}: "${randomDialogue}"`, 'info');
}

// Add keyboard event listener for 'E' key
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'e' && adventureMode && adventureFriends.length > 0) {
    const randomFriend = adventureFriends[Math.floor(Math.random() * adventureFriends.length)];
    talkToFriend(randomFriend);
  }
});
