// Local storage keys
const saveKey = 'RNGDPS_save';

// Game state variables
let totalResources = 0;
let currentDPS = 0;
let upgradeCost = 10;
let baseDPS = 1;
let currentLevel = 1;
let maxLevel = 10000;
let resourcesPerLevel = 100;
let levelProgress = 0;
let enemyHP, maxEnemyHP;
let enemyName, enemyResistance;
let playerHealth = 100;
let defensePower = 0;
let craftedEquipment = []; // List of crafted equipment
let equipmentCount = 35;
let equipmentList = generateEquipment(); // Equipment available to craft

// Enemy resistances and damage types
const damageTypes = ['physical', 'fire', 'ice'];
const enemies = [
    { name: 'Goblin', health: 50, resistance: 'fire' },
    { name: 'Orc', health: 200, resistance: 'ice' },
    { name: 'Troll', health: 500, resistance: 'physical' },
];

const bosses = [
    { name: 'Dragon', health: 1000, resistance: 'fire' },
    { name: 'Giant', health: 2000, resistance: 'physical' },
];

// Building costs and DPS contributions
let minionCost = 50, towerCost = 200, castleCost = 1000, defenseCost = 300;
let minionDPS = 0.5, towerDPS = 2, castleDPS = 10;
let enemyDamage = 10; // Default enemy damage per attack

// Load the game from localStorage if available
function loadGame() {
    const savedGame = JSON.parse(localStorage.getItem(saveKey));
    if (savedGame) {
        totalResources = savedGame.totalResources;
        currentDPS = savedGame.currentDPS;
        upgradeCost = savedGame.upgradeCost;
        baseDPS = savedGame.baseDPS;
        currentLevel = savedGame.currentLevel;
        maxLevel = savedGame.maxLevel;
        playerHealth = savedGame.playerHealth;
        defensePower = savedGame.defensePower;
        craftedEquipment = savedGame.craftedEquipment || [];
        updateCraftingUI();
        updateDisplay();
    }
}

// Save the game state to localStorage
function saveGame() {
    const gameState = {
        totalResources,
        currentDPS,
        upgradeCost,
        baseDPS,
        currentLevel,
        maxLevel,
        playerHealth,
        defensePower,
        craftedEquipment
    };
    localStorage.setItem(saveKey, JSON.stringify(gameState));
}

// Generate 35 equipment items
function generateEquipment() {
    const equipment = [];
    for (let i = 0; i < equipmentCount; i++) {
        const type = i % 3 === 0 ? 'Weapon' : 'Armor';
        const strength = Math.floor(Math.random() * 10) + 5;
        equipment.push({ id: i, name: `Equipment ${i + 1}`, type, strength, crafted: false });
    }
    return equipment;
}

// Update crafting UI
function updateCraftingUI() {
    const craftingList = document.getElementById('crafting-list');
    craftingList.innerHTML = '';
    equipmentList.forEach(equipment => {
        if (!equipment.crafted) {
            const li = document.createElement('li');
            li.innerText = `${equipment.name} (Type: ${equipment.type}, Strength: ${equipment.strength}) - Cost: ${equipment.strength * 100} resources`;
            const craftBtn = document.createElement('button');
            craftBtn.innerText = 'Craft';
            craftBtn.addEventListener('click', () => {
                if (totalResources >= equipment.strength * 100) {
                    totalResources -= equipment.strength * 100;
                    equipment.crafted = true;
                    craftedEquipment.push(equipment);
                    applyEquipmentBonus(equipment);
                    updateCraftingUI();
                    updateDisplay();
                }
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
        maxEnemyHP = newEnemy.health * Math.pow(1.2, currentLevel);
        enemyHP = maxEnemyHP;
        enemyResistance = newEnemy.resistance;
    }
    updateDisplay();
}

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
