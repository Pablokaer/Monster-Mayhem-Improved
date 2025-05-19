document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const continueButton = document.getElementById("continue-button");
  const startScreen = document.getElementById("start-screen");
  const infoScreen = document.getElementById("info-screen");
  const gameContainer = document.getElementById("game-container");

  // Hide the start and show the instruction screen
  startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    infoScreen.style.display = "flex";
  });

  // By clicking continue, you start the game.
  continueButton.addEventListener("click", () => {
    infoScreen.style.display = "none";
    gameContainer.style.display = "flex";

    // Only start the game after clicking continue
    initGame();
  });

  // Below is the rest of your code (functions, initGame etc.)
});

document.addEventListener("DOMContentLoaded", () => {
  const gridSize = 10;
  const hexGrid = document.getElementById("hex-grid");
  let selectedHex = null;
  let monsters = [];
  let player = null;
  let turnCounter = 1;
  let actionsRemaining = 2;
  let currentMode = null;
  let monstersKilled = 0;
  let traps = [];
  let powerups = [];

  // UI Elements
  const turnInfo = document.getElementById("turn-info");
  const statsInfo = document.getElementById("stats");
  const moveBtn = document.getElementById("move-btn");
  const attackBtn = document.getElementById("attack-btn");
  const endTurnBtn = document.getElementById("end-turn-btn");
  const attackOptions = document.getElementById("attack-options");
  const trapBtn = document.getElementById("trap-btn");
  const rangedBtn = document.getElementById("ranged-btn");
  const meleeBtn = document.getElementById("melee-btn");
  const gameOverScreen = document.getElementById("game-over");
  const finalScore = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");

  // Creates the 10x10 hexagonal grid
  function createHexGrid() {
    for (let row = 0; row < gridSize; row++) {
      const hexRow = document.createElement("div");
      hexRow.className = "hex-row";

      for (let col = 0; col < gridSize; col++) {
        const hexagon = document.createElement("div");
        hexagon.className = "hexagon";
        hexagon.dataset.row = row;
        hexagon.dataset.col = col;

        hexagon.addEventListener("click", handleHexClick);
        hexagon.addEventListener("mouseenter", handleHexHover);
        hexagon.addEventListener("mouseleave", handleHexHoverEnd);

        hexRow.appendChild(hexagon);
      }

      hexGrid.appendChild(hexRow);
    }
  }

  // Adds a random monster to the board
  function addMonster() {
    const maxAttempts = 100;
    let attempts = 0;

    function isAdjacentToPlayer(row, col) {
      if (!player) return false;

      const directionsEven = [
        [0, -1],
        [1, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
        [-1, -1],
      ];

      const directionsOdd = [
        [0, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
      ];

      const directions = player.row % 2 === 0 ? directionsEven : directionsOdd;

      return directions.some(([dr, dc]) => {
        const adjRow = player.row + dr;
        const adjCol = player.col + dc;
        return row === adjRow && col === adjCol;
      });
    }

    while (attempts < maxAttempts) {
      attempts++;

      const isHorizontalEdge = Math.random() < 0.5;
      let row, col;

      if (isHorizontalEdge) {
        row = Math.random() < 0.5 ? 0 : gridSize - 1;
        col = Math.floor(Math.random() * gridSize);
      } else {
        col = Math.random() < 0.5 ? 0 : gridSize - 1;
        row = Math.floor(Math.random() * gridSize);
      }

      // Prevents spawning in the player's cell or around it
      if (
        player &&
        ((row === player.row && col === player.col) ||
          isAdjacentToPlayer(row, col))
      ) {
        continue;
      }

      const hexagon = document.querySelector(
        `.hexagon[data-row="${row}"][data-col="${col}"]`
      );

      if (
        !hexagon ||
        hexagon.querySelector(".monster") ||
        hexagon.querySelector(".player") ||
        monsters.some((m) => m.row === row && m.col === col)
      ) {
        continue;
      }

      const monsterGifs = [
        "img/Hydra.gif",
        "img/Albino.gif",
        "img/R.gif",
        "img/Dragolisk.gif",
        "img/Hatch.gif",
        "img/Haunted.gif",
        "img/Ice_Dragon.gif",
      ];
      const randomGif =
        monsterGifs[Math.floor(Math.random() * monsterGifs.length)];

      const monster = document.createElement("img");
      monster.src = randomGif;
      monster.className = "monster";
      monster.dataset.row = row;
      monster.dataset.col = col;

      hexagon.appendChild(monster);
      monsters.push({ row, col, element: monster });
      return;
    }

    console.warn(
      "⚠️ Não foi possível posicionar um novo monstro após 100 tentativas."
    );
  }

  // Adds the player's character to the board
  function addPlayer() {
    return new Promise((resolve, reject) => {
      const maxAttempts = 100;
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        const hexagon = document.querySelector(
          `.hexagon[data-row="${row}"][data-col="${col}"]`
        );

        if (
          hexagon.querySelector(".monster") ||
          hexagon.querySelector(".powerup-item") ||
          monsters.some((m) => m.row === row && m.col === col) ||
          powerups.some((p) => p.row === row && p.col === col)
        )
          continue;

        const playerGifs = [
          "img/player/Asrak.gif",
          "img/player/Ceiron.gif",
          "img/player/Dario.gif",
          "img/player/Duria.gif",
          "img/player/Elane.gif",
          "img/player/Legola.gif",
          "img/player/Maealil.gif",
          "img/player/Trisha.gif",
        ];
        const randomPlayerGif =
          playerGifs[Math.floor(Math.random() * playerGifs.length)];

        const playerCharacter = new Image();
        playerCharacter.className = "player";
        playerCharacter.dataset.row = row;
        playerCharacter.dataset.col = col;

        playerCharacter.onload = () => {
          hexagon.classList.add("player-hex");
          hexagon.appendChild(playerCharacter);
          player = { row, col, element: playerCharacter };
          resolve(); // <- only after the player estar no tabuleiro
        };

        playerCharacter.onerror = () => {
          console.error("Erro ao carregar imagem do jogador");
          reject();
        };

        playerCharacter.src = randomPlayerGif;
        return;
      }

      console.warn("⚠️ Não foi possível posicionar o jogador");
      reject();
    });
  }

  // Handles the hover effect on the hexagon
  function handleHexHover(e) {
    if (
      !e.target.classList.contains("selected") &&
      !e.target.classList.contains("path") &&
      !e.target.classList.contains("attack-range") &&
      !e.target.classList.contains("adjacent") &&
      !e.target.classList.contains("trap") &&
      !e.target.classList.contains("range-attack") &&
      !e.target.classList.contains("powerup")
    ) {
      e.target.classList.add("hover-effect");
    }
  }

  function handleHexHoverEnd(e) {
    e.target.classList.remove("hover-effect");
  }

  // Handles the click event on the hexagon
  function handleHexClick(e) {
    const hexagon = e.target;
    const row = parseInt(hexagon.dataset.row);
    const col = parseInt(hexagon.dataset.col);

    // If clicking on a powerup
    if (hexagon.classList.contains("powerup")) {
      collectPowerup(row, col);
      return;
    }

    if (actionsRemaining <= 0) return;

    // If in move mode and clicked on a path hexagon
    if (currentMode === "move" && hexagon.classList.contains("path")) {
      movePlayer(row, col);
      actionsRemaining--;
      updateUI();
      clearHighlights();
      currentMode = null;
      return;
    }

    // If in trap mode and clicked on an adjacent hexagon
    if (currentMode === "trap" && hexagon.classList.contains("adjacent")) {
      placeTrap(row, col);
      actionsRemaining--;
      updateUI();
      clearHighlights();
      currentMode = null;
      // attackOptions.style.display = 'none';
      return;
    }

    // If in melee attack mode and clicked on a monster in range
    if (currentMode === "melee" && hexagon.classList.contains("attack-range")) {
      const monster = hexagon.querySelector(".monster");
      if (monster) {
        attackMonster(row, col);
        actionsRemaining--;
        updateUI();
        clearHighlights();
        currentMode = null;
        // attackOptions.style.display = 'none';
        return;
      }
    }

    // If in ranged attack mode and clicked on a monster in range
    if (
      currentMode === "ranged" &&
      hexagon.classList.contains("range-attack")
    ) {
      const monster = hexagon.querySelector(".monster");
      if (monster) {
        attackMonster(row, col);
        actionsRemaining--;
        updateUI();
        clearHighlights();
        currentMode = null;
        // attackOptions.style.display = 'none';
        return;
      }
    }

    // Highlight adjacent hexagons when clicking on player (clicar player)
    if (hexagon.classList.contains("player-hex")) {
      initMoveAction(actionsRemaining, currentMode);

      // clearHighlights();
      // showAdjacentHexagons();
      return;
    }

    // Deselect if already selected
    if (hexagon === selectedHex) {
      hexagon.classList.remove("selected");
      clearHighlights();
      selectedHex = null;
      currentMode = null;
      // attackOptions.style.display = 'none';
      return;
    }

    // Deselect the previous hexagon
    if (selectedHex) {
      selectedHex.classList.remove("selected");
      clearHighlights();
      // attackOptions.style.display = 'none';
    }

    // Select the new hexagon
    hexagon.classList.add("selected");
    selectedHex = hexagon;
  }

  // Moves the player to a new hexagon
  function movePlayer(newRow, newCol) {
    const oldHex = document.querySelector(
      `.hexagon[data-row="${player.row}"][data-col="${player.col}"]`
    );
    const newHex = document.querySelector(
      `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
    );

    oldHex.classList.remove("player-hex");
    oldHex.removeChild(player.element);

    newHex.appendChild(player.element);
    newHex.classList.add("player-hex");

    player.row = newRow;
    player.col = newCol;
    player.element.dataset.row = newRow;
    player.element.dataset.col = newCol;

    // Check if player stepped on a monster
    checkPlayerCollision();

    // Check if player stepped on a powerup
    const powerupIndex = powerups.findIndex(
      (p) => p.row === newRow && p.col === newCol
    );
    if (powerupIndex !== -1) {
      collectPowerup(newRow, newCol);
    }
  }

  // Attacks a monster with explosion animation
  function attackMonster(row, col) {
    const monsterIndex = monsters.findIndex(
      (m) => m.row === row && m.col === col
    );
    if (monsterIndex !== -1) {
      const monster = monsters[monsterIndex];
      const hexagon = document.querySelector(
        `.hexagon[data-row="${row}"][data-col="${col}"]`
      );

      // Create explosion animation
      const explosion = document.createElement("img");
      explosion.src = "img/explosion.gif";
      explosion.className = "explosion";
      hexagon.appendChild(explosion);

      // Remove explosion after animation
      setTimeout(() => {
        hexagon.removeChild(explosion);
      }, 500);

      // Remove monster after a small delay to see explosion
      setTimeout(() => {
        hexagon.removeChild(monster.element);
        monsters.splice(monsterIndex, 1);

        monstersKilled++;
        statsInfo.textContent = `Monsters killed: ${monstersKilled}`;

        // Drop a powerup item
        dropPowerup(row, col);

        const newMonstersCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < newMonstersCount; i++) {
          addMonster();
        }
      }, 300);
    }
  }

  // Drops a powerup item when monster dies
  function dropPowerup(row, col) {
    const chanceToDrop = 0.31;
    if (Math.random() > chanceToDrop) return;

    const powerupItems = [
      { src: "img/itens/Golden_Boots.gif", type: "extra_actions", chance: 0.3 },
      { src: "img/itens/Armor1.gif", type: "armor", chance: 0.2 },
      { src: "img/itens/Helmet1.gif", type: "helmet", chance: 0.05 },
      { src: "img/itens/Helmet2.gif", type: "helmet", chance: 0.05 },
      { src: "img/itens/Legs1.gif", type: "legs", chance: 0.1 },
      { src: "img/itens/Shield1.gif", type: "shield", chance: 0.1 },
      { src: "img/itens/Shield2.gif", type: "shield", chance: 0.05 },
      { src: "img/itens/Shield3.gif", type: "shield", chance: 0.05 },
    ];

    function pickRandomItem(items) {
      const rand = Math.random();
      let cumulative = 0;
      for (const item of items) {
        cumulative += item.chance;
        if (rand <= cumulative) return item;
      }
      return null;
    }

    const selectedItem = pickRandomItem(powerupItems);
    if (!selectedItem) return;

    const hexagon = document.querySelector(
      `.hexagon[data-row="${row}"][data-col="${col}"]`
    );
    if (!hexagon || powerups.some((p) => p.row === row && p.col === col))
      return;

    const powerupImg = document.createElement("img");
    powerupImg.src = selectedItem.src;
    powerupImg.className = "powerup-item";
    hexagon.appendChild(powerupImg);

    powerups.push({ row, col, element: powerupImg, type: selectedItem.type });

    hexagon.classList.add("powerup");

    console.log("Dropped item:", selectedItem);
  }

  // Collects a powerup item
  function collectPowerup(row, col) {
    const powerupIndex = powerups.findIndex(
      (p) => p.row === row && p.col === col
    );
    if (powerupIndex !== -1) {
      const powerup = powerups[powerupIndex];
      const hexagon = document.querySelector(
        `.hexagon[data-row="${row}"][data-col="${col}"]`
      );

      hexagon.removeChild(powerup.element);
      hexagon.classList.remove("powerup");
      powerups.splice(powerupIndex, 1);

      // Add extra action
      if (powerup.type === "shield") {
        actionsRemaining += 6;
      } else {
        actionsRemaining += 2;
      }
      // Você pode adicionar efeitos para outros tipos também
      console.log("Collected type:", powerup.type);

      updateUI();
    }
  }

  // Places a trap on a hexagon with visual marker
  function placeTrap(row, col) {
    const hexagon = document.querySelector(
      `.hexagon[data-row="${row}"][data-col="${col}"]`
    );

    // Add trap image
    const trapImg = document.createElement("img");
    trapImg.src = "img/itens/Sun_Catcher.gif";
    trapImg.className = "trap-image";
    hexagon.appendChild(trapImg);

    // Store trap reference
    traps.push({ row, col, element: trapImg });

    // Trap effect - will kill the next monster that steps on it
    const trapEffect = (e) => {
      const trappedHex = e.target;
      const monster = trappedHex.querySelector(".monster");
      if (monster) {
        const monsterIndex = monsters.findIndex(
          (m) =>
            m.row === parseInt(trappedHex.dataset.row) &&
            m.col === parseInt(trappedHex.dataset.col)
        );

        if (monsterIndex !== -1) {
          // Create explosion animation
          const explosion = document.createElement("img");
          explosion.src = "img/explosion.gif";
          explosion.className = "explosion";
          trappedHex.appendChild(explosion);

          setTimeout(() => {
            trappedHex.removeChild(explosion);
          }, 500);

          setTimeout(() => {
            trappedHex.removeChild(monster);
            monsters.splice(monsterIndex, 1);

            // Remove trap
            const trapIndex = traps.findIndex(
              (t) =>
                t.row === parseInt(trappedHex.dataset.row) &&
                t.col === parseInt(trappedHex.dataset.col)
            );
            if (trapIndex !== -1) {
              trappedHex.removeChild(traps[trapIndex].element);
              traps.splice(trapIndex, 1);
            }

            monstersKilled++;
            statsInfo.textContent = `Monsters killed: ${monstersKilled}`;

            // Drop a powerup item
            dropPowerup(
              parseInt(trappedHex.dataset.row),
              parseInt(trappedHex.dataset.col)
            );

            const newMonstersCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < newMonstersCount; i++) {
              addMonster();
            }
          }, 300);
        }
      }
      trappedHex.removeEventListener("click", trapEffect);
    };

    hexagon.addEventListener("click", trapEffect);
  }

  // Checks if player is on the same hex as a monster (game over)
  function checkPlayerCollision() {
    const playerHex = document.querySelector(
      `.hexagon[data-row="${player.row}"][data-col="${player.col}"]`
    );
    const monster = playerHex.querySelector(".monster");

    if (monster) {
      gameOver();
    }
  }

  // Shows game over screen
  function gameOver() {
    finalScore.textContent = monstersKilled;
    gameOverScreen.style.display = "flex";
  }

  // Restarts the game
  function restartGame() {
    // Clear the board
    monsters.forEach((monster) => {
      const hexagon = document.querySelector(
        `.hexagon[data-row="${monster.row}"][data-col="${monster.col}"]`
      );
      if (hexagon.querySelector(".monster")) {
        hexagon.removeChild(monster.element);
      }
    });

    traps.forEach((trap) => {
      const hexagon = document.querySelector(
        `.hexagon[data-row="${trap.row}"][data-col="${trap.col}"]`
      );
      if (hexagon.querySelector(".trap-image")) {
        hexagon.removeChild(trap.element);
      }
    });

    powerups.forEach((powerup) => {
      const hexagon = document.querySelector(
        `.hexagon[data-row="${powerup.row}"][data-col="${powerup.col}"]`
      );
      if (hexagon.querySelector(".powerup-item")) {
        hexagon.removeChild(powerup.element);
        hexagon.classList.remove("powerup");
      }
    });

    // Reset game state
    monsters = [];
    traps = [];
    powerups = [];
    monstersKilled = 0;
    turnCounter = 1;
    actionsRemaining = 2;
    currentMode = null;

    // Remove player
    const playerHex = document.querySelector(
      `.hexagon[data-row="${player.row}"][data-col="${player.col}"]`
    );
    playerHex.classList.remove("player-hex");
    playerHex.removeChild(player.element);
    player = null;

    // Hide game over screen
    gameOverScreen.style.display = "none";

    // Start new game
    addPlayer();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    dropInitialPowerup();
    dropInitialPowerup();
    dropInitialPowerup();
    updateUI();
  }

  // Shows adjacent hexagons (for highlighting when clicking on player)
  function showAdjacentHexagons() {
    const directions = [
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
    ];

    for (let [dr, dc] of directions) {
      const newRow = player.row + dr;
      const newCol = player.col + dc;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const adjacentHex = document.querySelector(
          `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
        );
        if (adjacentHex && !adjacentHex.querySelector(".monster")) {
          adjacentHex.classList.add("adjacent");
        }
      }
    }
  }

  // Shows possible paths for movement
  function showMovePaths() {
    const rowParity = player.row % 2;

    const directionsEven = [
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [-1, -1],
    ];

    const directionsOdd = [
      [0, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
    ];

    const directions = rowParity === 0 ? directionsEven : directionsOdd;

    for (let [dr, dc] of directions) {
      const newRow = player.row + dr;
      const newCol = player.col + dc;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const pathHex = document.querySelector(
          `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
        );
        if (pathHex && !pathHex.querySelector(".monster")) {
          pathHex.classList.add("path");
        }
      }
    }
  }

  function showMeleeAttackRange() {
    const rowParity = player.row % 2;

    const directionsEven = [
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [-1, -1],
    ];

    const directionsOdd = [
      [0, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
    ];

    const directions = rowParity === 0 ? directionsEven : directionsOdd;

    let foundMonster = false;

    for (let [dr, dc] of directions) {
      const newRow = player.row + dr;
      const newCol = player.col + dc;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const attackHex = document.querySelector(
          `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
        );
        if (attackHex && attackHex.querySelector(".monster")) {
          attackHex.classList.add("attack-range");
          foundMonster = true;
        }
      }
    }

    // If you killed a monster using melee
    if (foundMonster) {
      const chance = Math.random(); // retorna número entre 0 e 1
      if (chance <= 0.3) {
        console.log("🎲 Sorte! Você ganhou uma ação extra!");
        actionsRemaining = actionsRemaining + 1;
        player.extraAction = true; // exemplo
      }
    }
  }

  // Shows ranged attack range (up to 3 hexagons away)
  function showRangedAttackRange() {
    const range = 3;

    // Utility function to convert offset (col, row) to axial (q, r)
    function offsetToAxial(col, row) {
      const q = col;
      const r = row - Math.floor(col / 2);
      return [q, r];
    }

    // Utility function to convert axial (q, r) to offset (col, row)
    function axialToOffset(q, r) {
      const col = q;
      const row = r + Math.floor(col / 2);
      return [col, row];
    }

    const [centerQ, centerR] = offsetToAxial(player.col, player.row);

    for (let dq = -range; dq <= range; dq++) {
      for (let dr = -range; dr <= range; dr++) {
        const ds = -dq - dr;
        if (Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds)) <= range) {
          const q = centerQ + dq;
          const r = centerR + dr;
          const [col, row] = axialToOffset(q, r);

          if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            const attackHex = document.querySelector(
              `.hexagon[data-row="${row}"][data-col="${col}"]`
            );
            if (attackHex && attackHex.querySelector(".monster")) {
              attackHex.classList.add("range-attack");
            }
          }
        }
      }
    }
  }

  // Shows possible trap locations (adjacent empty hexagons)
  function showTrapLocations() {
    const rowParity = player.row % 2;

    const directionsEven = [
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [-1, -1],
    ];

    const directionsOdd = [
      [0, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
    ];

    const directions = rowParity === 0 ? directionsEven : directionsOdd;

    for (let [dr, dc] of directions) {
      const newRow = player.row + dr;
      const newCol = player.col + dc;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const trapHex = document.querySelector(
          `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
        );
        if (trapHex && !trapHex.querySelector(".monster")) {
          trapHex.classList.add("adjacent");
        }
      }
    }
  }

  // Clears all highlighted hexagons
  function clearHighlights() {
    document
      .querySelectorAll(
        ".path, .attack-range, .adjacent, .trap, .range-attack, .powerup"
      )
      .forEach((hex) => {
        hex.classList.remove(
          "path",
          "attack-range",
          "adjacent",
          "trap",
          "range-attack",
          "powerup"
        );
      });

    if (selectedHex) {
      selectedHex.classList.remove("selected");
      selectedHex = null;
    }
  }

  // Updates the UI elements and checks if turn should end
  function updateUI() {
    turnInfo.textContent = `Turn: ${turnCounter} | Actions remaining: ${actionsRemaining}`;
    statsInfo.textContent = `Monsters killed: ${monstersKilled}`;

    moveBtn.disabled = actionsRemaining <= 0;
    attackBtn.disabled = actionsRemaining <= 0;

    // Automatic end turn when no actions left
    if (actionsRemaining <= 0) {
      setTimeout(() => {
        endTurnBtn.click();
      }, 300); // Small delay for better UX
    }
  }

  // Move button click handler
  moveBtn.addEventListener("click", () => {
    if (actionsRemaining <= 0) return;

    clearHighlights();
    currentMode = "move";
    showMovePaths();
    // attackOptions.style.display = 'none';
  });

  // Attack button click handler
  attackBtn.addEventListener("click", () => {
    if (actionsRemaining <= 0) return;

    clearHighlights();
    // attackOptions.style.display = 'flex';
    // attackOptions.style.justifyContent = 'center';
  });

  // Trap attack option
  trapBtn.addEventListener("click", () => {
    currentMode = "trap";
    clearHighlights();
    showTrapLocations();
  });

  // Ranged attack option
  rangedBtn.addEventListener("click", () => {
    currentMode = "ranged";
    clearHighlights();
    showRangedAttackRange();
  });

  // Melee attack option
  meleeBtn.addEventListener("click", () => {
    currentMode = "melee";
    clearHighlights();
    showMeleeAttackRange();
  });

  // End turn button click handler
  endTurnBtn.addEventListener("click", () => {
    // Monster actions
    moveMonsters();

    // Reset for new turn
    turnCounter++;
    actionsRemaining = 2;
    currentMode = null;
    clearHighlights();
    // attackOptions.style.display = 'none';
    updateUI();

    // Check if player was caught by a monster
    checkPlayerCollision();
  });

  // Simple AI for monster movement - CORRIGIDA
  function moveMonsters() {
    monsters.forEach((monster) => {
      const directionsEven = [
        [0, -1],
        [1, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
        [-1, -1],
      ];

      const directionsOdd = [
        [0, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1],
        [-1, 0],
      ];

      const rowParity = monster.row % 2;
      const directions = rowParity === 0 ? directionsEven : directionsOdd;

      const bestDirection = directions.reduce(
        (best, [dr, dc]) => {
          const newRow = monster.row + dr;
          const newCol = monster.col + dc;

          if (
            newRow >= 0 &&
            newRow < gridSize &&
            newCol >= 0 &&
            newCol < gridSize
          ) {
            const distanceToPlayer =
              Math.abs(newRow - player.row) + Math.abs(newCol - player.col);
            if (distanceToPlayer < best.distance) {
              return { dr, dc, distance: distanceToPlayer };
            }
          }
          return best;
        },
        { dr: 0, dc: 0, distance: Infinity }
      );

      const newRow = monster.row + bestDirection.dr;
      const newCol = monster.col + bestDirection.dc;

      const isValidMove = !monsters.some(
        (m) => m !== monster && m.row === newRow && m.col === newCol
      );

      if (isValidMove) {
        const fromHex = document.querySelector(
          `.hexagon[data-row="${monster.row}"][data-col="${monster.col}"]`
        );
        const toHex = document.querySelector(
          `.hexagon[data-row="${newRow}"][data-col="${newCol}"]`
        );

        const trap = traps.find((t) => t.row === newRow && t.col === newCol);
        if (trap) {
          fromHex.removeChild(monster.element);
          const monsterIndex = monsters.findIndex((m) => m === monster);
          monsters.splice(monsterIndex, 1);

          toHex.removeChild(trap.element);
          traps = traps.filter((t) => t !== trap);

          const explosion = document.createElement("img");
          explosion.src = "img/explosion.gif";
          explosion.className = "explosion";
          toHex.appendChild(explosion);

          setTimeout(() => {
            toHex.removeChild(explosion);
          }, 500);

          monstersKilled++;

          statsInfo.textContent = `Monsters killed: ${monstersKilled}`;

          let newMonstersCount = Math.floor(Math.random() * 3) + 1; // Valor inicial

          // Logic to adjust the number of monsters based on the current turn
          if (turnCounter >= 5 && turnCounter < 10) {
            newMonstersCount += 1; // Add 1 to the value generated initially
          } else if (turnCounter >= 10 && turnCounter < 15) {
            newMonstersCount += 2; // Add 2 to the value generated initially
          } else if (turnCounter >= 15 && turnCounter < 20) {
            newMonstersCount += 3; // Add 3 to the value generated initially
          } else if (turnCounter >= 20) {
            newMonstersCount += 5; // Add 5 to the value generated initially
          }

          // Generate monsters
          for (let i = 0; i < newMonstersCount; i++) {
            addMonster();
          }

          return;
        }

        fromHex.removeChild(monster.element);
        toHex.appendChild(monster.element);

        monster.row = newRow;
        monster.col = newCol;
        monster.element.dataset.row = newRow;
        monster.element.dataset.col = newCol;

        if (monster.row === player.row && monster.col === player.col) {
          setTimeout(() => {
            gameOver();
          }, 300);
          return;
        }
      }
    });
  }
  function isAdjacentToPlayer(row, col) {
    const directionsEven = [
      [0, -1],
      [1, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
      [-1, -1],
    ];
    const directionsOdd = [
      [0, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
    ];

    const directions = player.row % 2 === 0 ? directionsEven : directionsOdd;

    return directions.some(
      ([dr, dc]) => row === player.row + dr && col === player.col + dc
    );
  }

  // Função para sortear um powerup no início do jogo
  function dropInitialPowerup() {
    const maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const hexagon = document.querySelector(
        `.hexagon[data-row="${row}"][data-col="${col}"]`
      );

      if (
        !hexagon ||
        hexagon.querySelector(".player") ||
        hexagon.querySelector(".monster") ||
        powerups.some((p) => p.row === row && p.col === col)
      ) {
        continue;
      }

      const powerupItems = [
        {
          src: "img/itens/Golden_Boots.gif",
          type: "extra_actions",
          chance: 0.3,
        },
        {
          src: "img/itens/Golden_Boots.gif",
          type: "extra_actions",
          chance: 0.3,
        },
        { src: "img/itens/Armor1.gif", type: "armor", chance: 0.2 },
        { src: "img/itens/Helmet1.gif", type: "helmet", chance: 0.05 },
        { src: "img/itens/Helmet2.gif", type: "helmet", chance: 0.05 },
        { src: "img/itens/Legs1.gif", type: "legs", chance: 0.1 },
        { src: "img/itens/Shield1.gif", type: "shield", chance: 0.1 },
        { src: "img/itens/Shield2.gif", type: "shield", chance: 0.05 },
        { src: "img/itens/Shield3.gif", type: "shield", chance: 0.05 },
      ];

      function pickRandomItem(items) {
        const rand = Math.random();
        let cumulative = 0;
        for (const item of items) {
          cumulative += item.chance;
          if (rand <= cumulative) return item;
        }
        return items[items.length - 1]; // fallback
      }

      const selectedItem = pickRandomItem(powerupItems);
      const powerupImg = document.createElement("img");
      powerupImg.src = selectedItem.src;
      powerupImg.className = "powerup-item";
      hexagon.appendChild(powerupImg);

      hexagon.classList.add("powerup");
      powerups.push({ row, col, element: powerupImg, type: selectedItem.type });
      return;
    }

    console.warn("⚠️ Não foi possível dropar o item inicial em 100 tentativas");
  }

  // Restart button handler
  restartBtn.addEventListener("click", restartGame);

  // Initializes the game
  async function initGame() {
    createHexGrid();

    await addPlayer(); // espera a imagem carregar antes de prosseguir

    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();
    addMonster();

    dropInitialPowerup();
    dropInitialPowerup();
    dropInitialPowerup();

    updateUI();
  }

  initGame();
});
