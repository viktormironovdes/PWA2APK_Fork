
function updateSkinSelector() {
  const skinSelector = document.getElementById('skinSelector');
  skinSelector.innerHTML = '';

  const skins = {
    default: { name: 'Default', emoji: '🐱' },
    shadow: { name: 'Shadow', emoji: '🐱‍👤' },
    golden: { name: 'Golden', emoji: '🟨🐱' },
    rainbow: { name: 'Rainbow', emoji: '🌈🐱' },
    cyber: { name: 'Cyber', emoji: '🤖🐱' },
    ninja: { name: 'Ninja', emoji: '🥷🐱' }
  };

  Object.keys(skins).forEach(skinId => {
    const skinDiv = document.createElement('div');
    skinDiv.style.cssText = `
      padding: 10px; background: rgba(255,255,255,0.1); border-radius: 10px;
      cursor: pointer; text-align: center; border: 2px solid transparent;
      transition: all 0.3s ease;
    `;

    if (catSkin === skinId) {
      skinDiv.style.borderColor = '#4ecdc4';
    }

    if (unlockedSkins.includes(skinId)) {
      skinDiv.innerHTML = `<div style="font-size: 2em;">${skins[skinId].emoji}</div><div>${skins[skinId].name}</div>`;
      skinDiv.onclick = () => changeSkin(skinId);
    } else {
      skinDiv.innerHTML = `<div style="font-size: 2em; filter: grayscale(1);">🔒</div><div>Locked</div>`;
      skinDiv.style.opacity = '0.5';
    }

    skinSelector.appendChild(skinDiv);
  });

  document.getElementById('currentSkinName').textContent = skins[catSkin]?.name || 'Default';
}

function changeSkin(skinId) {
  if (unlockedSkins.includes(skinId)) {
    catSkin = skinId;
    updateSkinSelector();
    // Update cat image with skin
    const catImg = document.getElementById('catImage');
    if (skinId !== 'default') {
      catImg.style.filter = getSkinFilter(skinId);
    } else {
      catImg.style.filter = 'none';
    }
  }
}

function getSkinFilter(skinId) {
  const filters = {
    shadow: 'brightness(0.3) contrast(2)',
    golden: 'sepia(1) saturate(2) hue-rotate(45deg)',
    rainbow: 'hue-rotate(90deg) saturate(2)',
    cyber: 'hue-rotate(180deg) contrast(1.5)',
    ninja: 'brightness(0.5) contrast(1.5)'
  };
  return filters[skinId] || 'none';
}

function updateQuestDisplay() {
  const questList = document.getElementById('questList');
  questList.innerHTML = '';

  dailyQuests.forEach(quest => {
    const questDiv = document.createElement('div');
    questDiv.style.cssText = `
      padding: 10px; margin: 5px 0; background: rgba(255,255,255,0.1);
      border-radius: 10px; border-left: 4px solid #4ecdc4;
    `;

    const progress = getQuestProgress(quest);
    const isComplete = progress >= quest.target;

    questDiv.innerHTML = `
      <div><strong>${quest.title}</strong></div>
      <div>${quest.description}</div>
      <div>Progress: ${progress}/${quest.target}</div>
      <div>Reward: ${quest.reward}</div>
      ${isComplete ? '<div style="color: #4ecdc4;">✅ Complete!</div>' : ''}
    `;

    questList.appendChild(questDiv);
  });
}

function getQuestProgress(quest) {
  switch (quest.id) {
    case 1: return totalClicks;
    case 2: return Math.floor(fish);
    case 3: return cursorCount + yarnCount + roboCount + wizardCount + portalCount + dragonCount;
    default: return 0;
  }
}

function updateLoreDisplay() {
  const loreEntriesDiv = document.getElementById('loreEntries');
  if (loreEntries.length === 0) {
    loreEntriesDiv.innerHTML = '<p>Unlock lore entries as you evolve your cat...</p>';
    return;
  }

  const allLore = [
    "The first purr echoes through dimensions...",
    "Ancient cat scrolls reveal the Fish Prophecy...",
    "The Great Cat Sphinx awakens from eternal slumber...",
    "Rainbow bridges connect all cat kingdoms...",
    "The Void Cats whisper secrets of infinite treats...",
    "Cosmic yarn balls spin the fabric of reality...",
    "The Cat Goddess bestows her eternal blessing...",
    "You have glimpsed the true form of Whiskers..."
  ];

  loreEntriesDiv.innerHTML = '';
  loreEntries.forEach(entryIndex => {
    if (allLore[entryIndex]) {
      const entryDiv = document.createElement('div');
      entryDiv.style.cssText = `
        padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.15);
        border-radius: 10px; border-left: 4px solid gold;
      `;
      entryDiv.innerHTML = `<strong>Entry ${entryIndex + 1}:</strong><br>${allLore[entryIndex]}`;
      loreEntriesDiv.appendChild(entryDiv);
    }
  });
}

function refreshQuests() {
  showNotification('Daily quests will refresh in 24 hours!', 'info');
}
