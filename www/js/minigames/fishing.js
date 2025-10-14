
// Fish Catch Game Variables
let fishCatchGame = {
  active: false,
  score: 0,
  timeLeft: 30,
  best: 0,
  fishes: []
};

function startFishCatch() {
  if (fishCatchGame.active) return;
  
  fishCatchGame.active = true;
  fishCatchGame.score = 0;
  fishCatchGame.timeLeft = 30;
  fishCatchGame.fishes = [];
  
  const area = document.getElementById('fishCatchArea');
  area.innerHTML = '<div id="fishCatchScore" style="position: absolute; top: 10px; left: 10px; font-weight: bold;">Score: 0</div><div id="fishCatchTimer" style="position: absolute; top: 10px; right: 10px; font-weight: bold;">30s</div>';
  
  const gameTimer = setInterval(() => {
    fishCatchGame.timeLeft--;
    document.getElementById('fishCatchTimer').textContent = fishCatchGame.timeLeft + 's';
    
    if (fishCatchGame.timeLeft <= 0) {
      clearInterval(gameTimer);
      endFishCatch();
    }
  }, 1000);
  
  const fishSpawner = setInterval(() => {
    if (!fishCatchGame.active) {
      clearInterval(fishSpawner);
      return;
    }
    spawnFish();
  }, 800);
}

function spawnFish() {
  const area = document.getElementById('fishCatchArea');
  const fish = document.createElement('div');
  fish.textContent = '🐟';
  fish.style.position = 'absolute';
  fish.style.left = Math.random() * (area.offsetWidth - 30) + 'px';
  fish.style.top = Math.random() * (area.offsetHeight - 30) + 'px';
  fish.style.fontSize = '1.5em';
  fish.style.cursor = 'pointer';
  fish.style.transition = 'all 0.3s ease';
  
  fish.onclick = () => {
    fishCatchGame.score++;
    document.getElementById('fishCatchScore').textContent = 'Score: ' + fishCatchGame.score;
    fish.remove();
  };
  
  area.appendChild(fish);
  
  setTimeout(() => {
    if (fish.parentNode) {
      fish.remove();
    }
  }, 3000);
}

function endFishCatch() {
  fishCatchGame.active = false;
  if (fishCatchGame.score > fishCatchGame.best) {
    fishCatchGame.best = fishCatchGame.score;
    document.getElementById('fishCatchBest').textContent = fishCatchGame.best;
  }
  minigameWins++;
  alert('Time\'s up! You caught ' + fishCatchGame.score + ' fish!');
}
