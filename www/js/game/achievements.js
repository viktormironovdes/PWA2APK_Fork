
// Dynamic Achievements System
let achievements = [];
let achievementIdCounter = 0;

// Base achievements
const baseAchievements = [
  { icon: '🌟', name: 'The Awakening', desc: 'Make your first click', threshold: 1, type: 'clicks' },
  { icon: '🐟', name: 'Fish Collector', desc: 'Collect 100 fish treats', threshold: 100, type: 'fish' },
  { icon: '⚔️', name: 'Click Warrior', desc: 'Click 500 times', threshold: 500, type: 'clicks' },
  { icon: '👥', name: 'Helper Master', desc: 'Own 10 helpers total', threshold: 10, type: 'helpers' },
  { icon: '💯', name: 'Thousand Clicks', desc: 'Click 1000 times', threshold: 1000, type: 'clicks' },
  { icon: '💰', name: 'Fish Hoarder', desc: 'Collect 10,000 fish', threshold: 10000, type: 'fish' },
  { icon: '🤖', name: 'Automation Lord', desc: 'Reach 100 treats per second', threshold: 100, type: 'fps' },
  { icon: '🏆', name: 'Click Legend', desc: 'Click 5000 times', threshold: 5000, type: 'clicks' },
  { icon: '💎', name: 'Fish Tycoon', desc: 'Collect 100,000 fish', threshold: 100000, type: 'fish' },
  { icon: '👑', name: 'Army Commander', desc: 'Own 50 helpers total', threshold: 50, type: 'helpers' },
  { icon: '⚡', name: 'Speed Demon', desc: 'Reach 500 treats per second', threshold: 500, type: 'fps' },
  { icon: '🌀', name: 'Portal Master', desc: 'Own a Fish Portal Generator', threshold: 1, type: 'portals' },
  { icon: '🐉', name: 'Dragon Tamer', desc: 'Own an Elder Dragon Cat', threshold: 1, type: 'dragons' },
  { icon: '🏅', name: 'Fish Millionaire', desc: 'Collect 1,000,000 fish', threshold: 1000000, type: 'fish' },
  { icon: '🌟', name: 'Ultimate Clicker', desc: 'Reach the maximum power level', threshold: 7, type: 'power' },
  { icon: '🎮', name: 'Mini Game Master', desc: 'Win 10 mini games', threshold: 10, type: 'minigames' },
  { icon: '🎯', name: 'Memory Champion', desc: 'Complete memory game level 5', threshold: 5, type: 'memory' },
  { icon: '🐠', name: 'Fishing Pro', desc: 'Catch 100 fish in fishing game', threshold: 100, type: 'fishing' }
];

// Initialize achievements
function initializeAchievements() {
  achievements = baseAchievements.map(achievement => ({
    ...achievement,
    id: achievementIdCounter++,
    achieved: false
  }));
  generateEndlessAchievements();
}

// Generate endless achievements
function generateEndlessAchievements() {
  const clickMilestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];
  const fishMilestones = [5000000, 10000000, 25000000, 50000000, 100000000, 250000000, 500000000, 1000000000];
  const fpsMilestones = [1000, 2500, 5000, 10000, 25000, 50000, 100000];
  
  clickMilestones.forEach(milestone => {
    achievements.push({
      id: achievementIdCounter++,
      icon: '⚡',
      name: `Click Master ${milestone.toLocaleString()}`,
      desc: `Click ${milestone.toLocaleString()} times`,
      threshold: milestone,
      type: 'clicks',
      achieved: false
    });
  });

  fishMilestones.forEach(milestone => {
    achievements.push({
      id: achievementIdCounter++,
      icon: '🐠',
      name: `Fish Baron ${milestone.toLocaleString()}`,
      desc: `Collect ${milestone.toLocaleString()} fish`,
      threshold: milestone,
      type: 'fish',
      achieved: false
    });
  });

  fpsMilestones.forEach(milestone => {
    achievements.push({
      id: achievementIdCounter++,
      icon: '🚀',
      name: `Speed Lord ${milestone.toLocaleString()}`,
      desc: `Reach ${milestone.toLocaleString()} treats per second`,
      threshold: milestone,
      type: 'fps',
      achieved: false
    });
  });
}

function checkAchievements() {
  achievements.forEach(achievement => {
    if (!achievement.achieved) {
      let current = 0;
      switch (achievement.type) {
        case 'clicks':
          current = totalClicks;
          break;
        case 'fish':
          current = Math.floor(fish);
          break;
        case 'fps':
          current = fishPerSecond;
          break;
        case 'helpers':
          current = cursorCount + yarnCount + roboCount + wizardCount + portalCount + dragonCount;
          break;
        case 'portals':
          current = portalCount;
          break;
        case 'dragons':
          current = dragonCount;
          break;
        case 'power':
          current = powerLevel;
          break;
        case 'minigames':
          current = minigameWins;
          break;
        case 'memory':
          current = memoryLevel;
          break;
        case 'fishing':
          current = fishCatchGame.score;
          break;
      }
      
      if (current >= achievement.threshold) {
        achievement.achieved = true;
        showAchievement(achievement);
        updateAchievementDisplay();
      }
    }
  });
}

function showAchievement(achievement) {
  const achievementDiv = document.createElement('div');
  achievementDiv.className = 'achievement';
  achievementDiv.innerHTML = `
    <strong>🏆 Achievement Unlocked!</strong><br>
    ${achievement.name}<br>
    <small>${achievement.desc}</small>
  `;
  document.body.appendChild(achievementDiv);
  
  setTimeout(() => achievementDiv.remove(), 4000);
}

function updateAchievementDisplay() {
  const achievementList = document.getElementById('achievementList');
  achievementList.innerHTML = '';
  
  // Sort achievements: unlocked first, then by threshold
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    return a.threshold - b.threshold;
  });
  
  // Show only first 20 achievements to avoid overwhelming
  sortedAchievements.slice(0, 20).forEach(achievement => {
    const achievementDiv = document.createElement('div');
    achievementDiv.className = `achievement-item ${achievement.achieved ? 'unlocked' : ''}`;
    achievementDiv.innerHTML = `
      <span class="achievement-icon">${achievement.icon}</span>
      <div>
        <strong>${achievement.name}</strong><br>
        <small>${achievement.desc}</small>
      </div>
    `;
    achievementList.appendChild(achievementDiv);
  });
}
