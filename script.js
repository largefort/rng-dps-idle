// Variables for game state
let totalResources = 0;
let currentDPS = 0;
let baseDPS = 1;
let playerHealth = 100;
let defensePower = 0;
let currentLevel = 1;
let maxLevel = 10000;
let enemyName = '';
let enemyHP;
let maxEnemyHP;
let enemyResistance;
let damageTypes = ['Physical', 'Fire', 'Ice'];
let upgradeCost = 100;
let minionCost = 150;
let towerCost = 200;
let castleCost = 250;
let defenseCost = 50;
let equipmentList = [];
let playerEquipment = [];
let craftingResources = 0;

// Auto-save/load using localStorage
function saveGame() {
    const gameData = {
        totalResources,
        currentDPS,
        baseDPS,
        playerHealth,
        defensePower,
        currentLevel,
        playerEquipment,
    };
    localStorage.setItem('gameData', JSON.stringify(gameData));
}

function loadGame() {
    const savedData = JSON.parse(localStorage.getItem('gameData'));
    if (savedData) {
        totalResources = savedData.totalResources || 0;
        currentDPS = savedData.currentDPS || 0;
        baseDPS = savedData.baseDPS || 1;
        playerHealth = savedData.playerHealth || 100;
        defensePower = savedData.defensePower || 0;
        currentLevel = savedData.currentLevel || 1;
        playerEquipment = savedData.playerEquipment || [];
    }
}

// Generate random enemy for each level
function getEnemyForLevel() {
    const enemyBaseHealth = 100;
    const resistances = ['Physical', 'Fire', 'Ice', null];
    const randomResistance = resistances[Math.floor(Math.random() * resistances.length)];
    return {
        name: `Enemy Level ${currentLevel}`,
        health: enemyBaseHealth * Math.pow(1.2, currentLevel),
        resistance: randomResistance
    };
}

// Equipment crafting
function updateCraftingUI() {
    const craftingList = document.getElementById('crafting-list');
    craftingList.innerHTML = '';
    equipmentList.forEach((equipment, index) => {
        if (equipment.cost <= totalResources) {
            const li = document.createElement('li');
            li.innerText = `${equipment.name} (Type: ${equipment.type}, Strength: ${equipment.strength}) - Cost: ${equipment.cost} resources`;
            const craftBtn = document.createElement('button');
            craftBtn.innerText = 'Craft';
            craftBtn.addEventListener('click', () => {
                totalResources -= equipment.cost;
                playerEquipment.push(equipment);
                applyEquipmentBonus(equipment);
                updateCraftingUI();
                updateDisplay();
            });
            li.appendChild(craftBtn);
            craftingList.appendChild(li);
        }
    });
}

// Apply equipment bonus to player stats
function applyEquipmentBonus(equipment) {
    if (equipment.type === 'Weapon') {
        baseDPS += equipment.strength;
    } else if (equipment.type === 'Armor') {
        defensePower += equipment.strength;
    }
}

// Function to display damage text
function showDamageText(damage, damageType) {
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.innerText = `-${damage.toFixed(1)} (${damageType})`;
    damageText.style.left = Math.random() * 80 + '%';
    document.getElementById('damage-text-container').appendChild(damageText);

    // Remove the text after animation
    setTimeout(() => {
        damageText.remove();
    }, 1000);
}

// Start the game
document.getElementById('play-btn').addEventListener('click', () => {
    document.querySelector('.title-screen').style.display = 'none';
    document.querySelector('.game-container').style.display = 'block';
    loadGame();
    updateDisplay();
});

// RNG attack for random DPS with resistance calculation and damage text
document.getElementById('attack-btn').addEventListener('click', () => {
    let rngDPS = Math.random() * (baseDPS * 10);
    let damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)];

    // Apply resistance
    let effectiveDPS = rngDPS;
    if (enemyResistance === damageType) {
        effectiveDPS = rngDPS * 0.5; // Resistance cuts DPS in half
    }

    totalResources += effectiveDPS;
    currentDPS += effectiveDPS / 10;
    enemyHP -= effectiveDPS;

    showDamageText(effectiveDPS, damageType); // Show damage text

    if (enemyHP <= 0) {
        levelUp();
    }

    updateDisplay();
});

// Auto damage from buildings and save every second
setInterval(() => {
    totalResources += currentDPS;
    if (enemyHP > 0) {
        enemyHP -= currentDPS;
        if (enemyHP <= 0) {
            levelUp();
        }
    }
    updateDisplay();
    saveGame(); // Auto-save the game every second
}, 1000);

// Auto enemy attack every 5 seconds
setInterval(() => {
    if (enemyHP > 0) {
        let actualDamage = Math.max(0, enemyDamage - defensePower);
        playerHealth -= actualDamage;
        if (playerHealth <= 0) {
            alert("Game Over! You were defeated.");
            playerHealth = 100; // Reset health
        }
        updateDisplay();
    }
}, 5000);

// Level up and generate a new enemy
function levelUp() {
    currentLevel++;
    if (currentLevel <= maxLevel) {
        let newEnemy = getEnemyForLevel();
        enemyName = newEnemy.name;
        maxEnemyHP = newEnemy.health;
        enemyHP = maxEnemyHP;
        enemyResistance = newEnemy.resistance;
    } else {
        enemyName = 'No more enemies';
        enemyHP = undefined;
        maxEnemyHP = undefined;
        enemyResistance = 'None';
    }
    updateDisplay();
}

// Update the display with game stats
function updateDisplay() {
    document.getElementById('resources').innerText = totalResources.toFixed(0);
    document.getElementById('dps').innerText = currentDPS.toFixed(1);
    document.getElementById('level').innerText = currentLevel;
    document.getElementById('player-health').innerText = playerHealth.toFixed(0);
    document.getElementById('upgrade-cost').innerText = upgradeCost;
    document.getElementById('minion-cost').innerText = minionCost;
    document.getElementById('tower-cost').innerText = towerCost;
    document.getElementById('castle-cost').innerText = castleCost;
    document.getElementById('defense-cost').innerText = defenseCost;
    document.getElementById('enemy-name').innerText = enemyName || 'Unknown';
    
    // Check if enemyHP is properly defined
    if (enemyHP !== undefined && !isNaN(enemyHP)) {
        document.getElementById('enemy-health').innerText = enemyHP.toFixed(0);
    } else {
        document.getElementById('enemy-health').innerText = 'N/A';
    }

    // Check if maxEnemyHP is properly defined for the health bar
    if (maxEnemyHP !== undefined && !isNaN(maxEnemyHP) && enemyHP !== undefined && !isNaN(enemyHP)) {
        let healthPercent = (enemyHP / maxEnemyHP) * 100;
        document.getElementById('enemy-health-bar').style.width = healthPercent + '%';
    } else {
        document.getElementById('enemy-health-bar').style.width = '0%';
    }
    
    document.getElementById('enemy-resistance').innerText = enemyResistance || 'None';
}

// Initial setup and game start
function startGame() {
    levelUp();
    updateCraftingUI();
    updateDisplay();
}
