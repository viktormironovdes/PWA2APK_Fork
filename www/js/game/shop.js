
// Shop functions
function buyCursor() {
  if (fish >= cursorCost) {
    fish -= cursorCost;
    cursorCount++;
    fishPerSecond += 1;
    cursorCost = Math.floor(cursorCost * 1.25);
    updateDisplay();
  }
}

function buyYarn() {
  if (fish >= yarnCost) {
    fish -= yarnCost;
    yarnCount++;
    fishPerSecond += 3;
    yarnCost = Math.floor(yarnCost * 1.3);
    updateDisplay();
  }
}

function buyRobo() {
  if (fish >= roboCost) {
    fish -= roboCost;
    roboCount++;
    fishPerSecond += 15;
    roboCost = Math.floor(roboCost * 1.35);
    updateDisplay();
  }
}

function buyWizard() {
  if (fish >= wizardCost) {
    fish -= wizardCost;
    wizardCount++;
    fishPerSecond += 50;
    wizardCost = Math.floor(wizardCost * 1.4);
    updateDisplay();
  }
}

function buyPortal() {
  if (fish >= portalCost) {
    fish -= portalCost;
    portalCount++;
    fishPerSecond += 200;
    portalCost = Math.floor(portalCost * 1.5);
    updateDisplay();
  }
}

function buyDragon() {
  if (fish >= dragonCost) {
    fish -= dragonCost;
    dragonCount++;
    fishPerSecond += 1000;
    dragonCost = Math.floor(dragonCost * 1.6);
    updateDisplay();
  }
}

function updateItemAvailability() {
  const items = [
    { element: 'cursorItem', cost: cursorCost },
    { element: 'yarnItem', cost: yarnCost },
    { element: 'roboItem', cost: roboCost },
    { element: 'wizardItem', cost: wizardCost },
    { element: 'portalItem', cost: portalCost },
    { element: 'dragonItem', cost: dragonCost }
  ];

  items.forEach(item => {
    const element = document.getElementById(item.element);
    if (fish >= item.cost) {
      element.classList.remove('item-disabled');
    } else {
      element.classList.add('item-disabled');
    }
  });
}
