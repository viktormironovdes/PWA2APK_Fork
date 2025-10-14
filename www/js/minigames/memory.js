
// Memory Game Variables
let memorySequence = [];
let playerSequence = [];
let memoryLevel = 1;
let memoryScore = 0;
let memoryGameActive = false;

function createMemoryGrid() {
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'minigame-cell';
    cell.textContent = '🐱';
    cell.onclick = () => memoryClick(i);
    grid.appendChild(cell);
  }
}

function startMemoryGame() {
  if (memoryGameActive) return;
  
  memoryGameActive = true;
  memorySequence = [];
  playerSequence = [];
  memoryLevel = 1;
  
  for (let i = 0; i < 3; i++) {
    memorySequence.push(Math.floor(Math.random() * 16));
  }
  
  showMemorySequence();
}

function showMemorySequence() {
  const cells = document.querySelectorAll('.minigame-cell');
  cells.forEach(cell => cell.classList.remove('active'));
  
  let index = 0;
  const interval = setInterval(() => {
    if (index > 0) {
      cells[memorySequence[index - 1]].classList.remove('active');
    }
    
    if (index < memorySequence.length) {
      cells[memorySequence[index]].classList.add('active');
      index++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        cells.forEach(cell => cell.classList.remove('active'));
      }, 500);
    }
  }, 600);
}

function memoryClick(index) {
  if (!memoryGameActive) return;
  
  playerSequence.push(index);
  
  if (playerSequence[playerSequence.length - 1] !== memorySequence[playerSequence.length - 1]) {
    // Wrong answer
    memoryGameActive = false;
    alert('Game Over! Final level: ' + memoryLevel);
    return;
  }
  
  if (playerSequence.length === memorySequence.length) {
    // Level completed
    memoryScore += memoryLevel * 10;
    memoryLevel++;
    minigameWins++;
    
    document.getElementById('memoryScore').textContent = memoryScore;
    
    // Add more to sequence
    memorySequence.push(Math.floor(Math.random() * 16));
    playerSequence = [];
    
    setTimeout(() => {
      showMemorySequence();
    }, 1000);
  }
}
