
function updateDisplay() {
  document.getElementById('fish').textContent = Math.floor(fish).toLocaleString();
  document.getElementById('fps').textContent = fishPerSecond.toLocaleString();
  document.getElementById('totalClicks').textContent = totalClicks.toLocaleString();
  document.getElementById('powerLevel').textContent = powerLevel;
  document.getElementById('evolutionLevel').textContent = evolutionLevel;
  document.getElementById('purrCrystals').textContent = purrCrystals;
  document.getElementById('comboMeter').textContent = comboMeter;
  document.getElementById('minigameWins').textContent = minigameWins;

  // Update combo meter visual
  document.getElementById('comboValue').textContent = comboMeter;
  document.getElementById('comboFill').style.width = comboMeter + '%';

  // Update evolution display
  updateEvolutionDisplay();

  // Update prestige button
  const prestigeBtn = document.getElementById('prestigeButton');
  if (fish >= 1000000) {
    prestigeBtn.disabled = false;
    prestigeBtn.style.opacity = '1';
    document.getElementById('availableCrystals').textContent = Math.floor(fish / 100000);
  } else {
    prestigeBtn.disabled = true;
    prestigeBtn.style.opacity = '0.5';
  }

  document.getElementById('cursorCost').textContent = cursorCost.toLocaleString();
  document.getElementById('cursorCount').textContent = cursorCount;

  document.getElementById('yarnCost').textContent = yarnCost.toLocaleString();
  document.getElementById('yarnCount').textContent = yarnCount;

  document.getElementById('roboCost').textContent = roboCost.toLocaleString();
  document.getElementById('roboCount').textContent = roboCount;

  document.getElementById('wizardCost').textContent = wizardCost.toLocaleString();
  document.getElementById('wizardCount').textContent = wizardCount;

  document.getElementById('portalCost').textContent = portalCost.toLocaleString();
  document.getElementById('portalCount').textContent = portalCount;

  document.getElementById('dragonCost').textContent = dragonCost.toLocaleString();
  document.getElementById('dragonCount').textContent = dragonCount;

  // Update achievement count
  const unlockedCount = achievements.filter(a => a.achieved).length;
  document.getElementById('achievementCount').textContent = unlockedCount;
  document.getElementById('totalAchievements').textContent = achievements.length;

  // Update item availability
  updateItemAvailability();
  checkAchievements();
  updateStory();
  updatePowerLevel();
}

function showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Hide game container and adventure mode
  document.getElementById('gameContainer').style.display = 'none';
  if (document.getElementById('adventureContainer')) {
    document.getElementById('adventureContainer').style.display = 'none';
  }
  
  // Show selected screen
  if (screenName === 'game') {
    document.getElementById('gameContainer').style.display = 'block';
  } else if (screenName === 'adventure') {
    if (document.getElementById('adventureContainer')) {
      document.getElementById('adventureContainer').style.display = 'block';
    }
  } else {
    document.getElementById(screenName + 'Screen').classList.add('active');
  }
  
  currentScreen = screenName;
}

function createStars() {
  const starsContainer = document.querySelector('.stars');
  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.width = star.style.height = Math.random() * 3 + 1 + 'px';
    star.style.animationDelay = Math.random() * 2 + 's';
    starsContainer.appendChild(star);
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; padding: 15px; border-radius: 10px;
    z-index: 1000; color: white; font-weight: bold; opacity: 0;
    transition: opacity 0.3s ease; max-width: 300px;
  `;
  
  const colors = {
    success: 'background: linear-gradient(45deg, #4ecdc4, #44a08d);',
    error: 'background: linear-gradient(45deg, #ff6b6b, #ee5a52);',
    info: 'background: linear-gradient(45deg, #45b7d1, #3498db);'
  };
  
  notification.style.cssText += colors[type] || colors.info;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.opacity = '1', 100);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateEvolutionDisplay() {
  const forms = [
    { name: 'Kitten', emoji: '🐱' },
    { name: 'House Cat', emoji: '🐈' },
    { name: 'Magical Cat', emoji: '✨🐱' },
    { name: 'Cyber Cat', emoji: '🤖🐱' },
    { name: 'Dragon Cat', emoji: '🐉🐱' },
    { name: 'Cosmic Cat', emoji: '🌌🐱' },
    { name: 'Void Cat', emoji: '🌑🐱' },
    { name: 'God Cat', emoji: '👑🐱' },
    { name: 'Transcendent Cat', emoji: '🌟🐱' },
    { name: 'Ultimate Cat', emoji: '💫🐱' }
  ];

  const currentForm = forms[evolutionLevel] || forms[0];
  document.getElementById('currentForm').textContent = currentForm.name;
  document.getElementById('evolutionImage').textContent = currentForm.emoji;
  document.getElementById('evolutionProgress').textContent = powerLevel % 10;
}

function updateStory() {
  const newStage = Math.min(Math.floor(Math.log10(Math.max(fish, 1))), storyStages.length - 1);
  if (newStage > storyStage) {
    storyStage = newStage;
    // Auto-advance slideshow when story progresses
    if (newStage < 7) {
      showSlide(newStage);
    }
  }
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  
  // Hide current slide
  if (slides[currentSlideIndex]) {
    slides[currentSlideIndex].classList.remove('active');
  }
  
  // Update index
  currentSlideIndex = index;
  if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
  if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;
  
  // Show new slide
  if (slides[currentSlideIndex]) {
    slides[currentSlideIndex].classList.add('active');
  }
  
  // Update counter
  document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
}

function nextSlide() {
  showSlide(currentSlideIndex + 1);
}

function previousSlide() {
  showSlide(currentSlideIndex - 1);
}

function updatePowerLevel() {
  const newPowerLevel = Math.min(Math.floor(totalClicks / 200) + Math.floor(fishPerSecond / 50) + 1, 50);
  if (newPowerLevel > powerLevel) {
    powerLevel = newPowerLevel;
    
    // Check for evolution
    if (powerLevel % 10 === 0) {
      evolutionLevel++;
      loreEntries.push(evolutionLevel - 1);
      showNotification(`🧬 Evolution! Your cat has evolved!`, 'success');
    }
    
    showPowerLevelUp();
  }
}

function showPowerLevelUp() {
  const powerUpDiv = document.createElement('div');
  powerUpDiv.className = 'power-level-up';
  powerUpDiv.innerHTML = `
    ⭐ POWER LEVEL UP! ⭐<br>
    Cat Power Level: ${powerLevel}<br>
    🌟 Whiskers grows stronger! 🌟
  `;
  document.body.appendChild(powerUpDiv);
  
  setTimeout(() => powerUpDiv.remove(), 3000);
}
