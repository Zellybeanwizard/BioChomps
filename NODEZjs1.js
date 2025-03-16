/**
 * NODEZ Enhancement Module v1.0
 * 
 * This module extends and improves the NODEZv3 game by:
 * - Addressing potential bugs and edge cases
 * - Adding performance optimizations
 * - Improving game balance and quality of life features
 * - Enhancing accessibility
 * 
 * How to use: Include this script after the original NODEZv3.txt file
 */

// Wait for the original game code to load before applying enhancements
document.addEventListener('DOMContentLoaded', () => {
  console.log('NODEZ Enhancement Module initialized');
  enhanceNODEZ();
});

function enhanceNODEZ() {
  // Store original functions to extend them
  const originalInitGame = window.initGame;
  const originalGenerateAssets = window.generateAssets;
  const originalRenderMap = window.renderMap;
  const originalHandleGridClick = window.handleGridClick;
  const originalCalculatePath = window.calculatePath;
  const originalCalculateIncome = window.calculateIncome;
  const originalBuildConnection = window.buildConnection;
  
  // =============================================
  // GAME CONFIGURATION IMPROVEMENTS
  // =============================================
  
  // Extract game constants for easier balancing and modification
  window.GAME_CONFIG = {
    // Economy
    STARTING_MONEY: 500,
    STARTING_MOVES: 2,
    TREE_CLEAR_COST: 50,
    ROCK_CLEAR_COST: 150,
    TUNNEL_COST: 500,
    ROAD_COST: 15,
    BRIDGE_COST: 35,
    HIGHWAY_COST_PER_TILE: 5,
    SHIPPING_LANE_COST: 300,
    REFINERY_COST: 20,
    REFINERY_UPGRADE_COST: 40,
    FACTORY_COST: 100,
    FACTORY_UPGRADE_COST: 200,
    DOG_BONUS: 50,
    
    // Income multipliers
    REFINERY_INCOME: 10,
    FACTORY_MULTIPLIER: 3,
    FACTORY_UPGRADED_MULTIPLIER: 4,
    
    // Game progression
    TAX_START_TURN: 5,
    TAX_INCREASE_INTERVAL: 5,
    MOVE_INCREASE_INTERVAL: 5,
    MAX_ROAD_LENGTH: 30,
    
    // Map generation
    TREE_DENSITY: 0.08,
    ROCK_DENSITY: 0.04,
    MOUNTAIN_DENSITY: 0.02,
    RIVER_DENSITY: 0.03,
    LAKE_DENSITY: 0.01,
    RESOURCE_COUNT: 5,
    NODE_COUNT: 12,
    
    // Node costs distribution
    LOW_COST_NODE_MIN: 50,
    LOW_COST_NODE_MAX: 200,
    MID_COST_NODE_MIN: 150,
    MID_COST_NODE_MAX: 300,
    HIGH_COST_NODE_1: 500,
    HIGH_COST_NODE_2: 1000,
    MASTER_NODE_COST: 2222
  };
  
  // =============================================
  // BUG FIXES AND IMPROVEMENTS
  // =============================================
  
  // Extend the initGame function to use our configuration
  window.initGame = function() {
    // Apply configuration
    gameState.money = GAME_CONFIG.STARTING_MONEY;
    gameState.movesRequired = GAME_CONFIG.STARTING_MOVES;
    gameState.nextTaxTurn = GAME_CONFIG.TAX_START_TURN;
    
    // Call the original function
    originalInitGame.call(this);
    
    // Add keyboard support after initialization
    setupKeyboardControls();
    
    // Initialize audio system
    initAudioSystem();
    
    // Add saving/loading capability
    setupSaveLoadSystem();
  };
  
  // Improve grid calculation to prevent rendering issues
  window.calculateGrid = function() {
    const display = document.getElementById('ascii-display');
    // Use Math.max to ensure minimum grid size
    GRID_WIDTH = Math.max(20, Math.floor((display.clientWidth) / 10));
    GRID_HEIGHT = Math.max(15, Math.floor((display.clientHeight) / 18));
  };
  
  // Enhance path calculation to better handle edge cases
  window.calculatePath = function(from, to) {
    // Validate input coordinates
    if (!from || !to || 
        from.x < 0 || from.x >= GRID_WIDTH || from.y < 0 || from.y >= GRID_HEIGHT ||
        to.x < 0 || to.x >= GRID_WIDTH || to.y < 0 || to.y >= GRID_HEIGHT) {
      console.error("Invalid path coordinates", from, to);
      return null;
    }
    
    return originalCalculatePath.call(this, from, to);
  };
  
  // Fix potential income calculation issues
  window.calculateIncome = function() {
    let income = 0;
    
    // Income from connected resources with refineries and factories
    for (const resource of gameState.resources) {
      if (!resource.connected) continue;
      
      let resourceIncome = 0;
      
      // Base income from regular refineries
      const regularRefineries = resource.refineries - (resource.refineriesUpgraded || 0);
      resourceIncome += regularRefineries * GAME_CONFIG.REFINERY_INCOME;
      
      // Income from upgraded refineries (doubled)
      resourceIncome += (resource.refineriesUpgraded || 0) * GAME_CONFIG.REFINERY_INCOME * 2;
      
      // Factory multiplier
      if (resource.factory) {
        const multiplier = resource.factoryUpgraded ? 
          GAME_CONFIG.FACTORY_UPGRADED_MULTIPLIER : GAME_CONFIG.FACTORY_MULTIPLIER;
        resourceIncome *= multiplier;
      }
      
      income += resourceIncome;
    }
    
    // Dog bonus
    if (gameState.dogBonus) {
      income += GAME_CONFIG.DOG_BONUS;
    }
    
    return income;
  };
  
  // Fix connection validation to ensure connections are only made between valid points
  window.buildConnection = function(fromNode, toPos, connectionType) {
    const toNode = gameState.nodes.find(n => n.x === toPos.x && n.y === toPos.y);
    if (!toNode) {
      setStatusMessage("Invalid target for connection.");
      document.getElementById('context-menu').style.display = 'none';
      return;
    }
    
    // Check if source node is connected
    if (!fromNode.connected) {
      setStatusMessage("Source node must be connected to the network.");
      document.getElementById('context-menu').style.display = 'none';
      return;
    }
    
    // Continue with original implementation
    originalBuildConnection.call(this, fromNode, toPos, connectionType);
  };
  
  // Improve map generation to ensure better resource distribution
  window.generateAssets = function() {
    // Call original function
    originalGenerateAssets.call(this);
    
    // Ensure resources aren't trapped by obstacles
    ensureAccessibleResources();
    
    // Add difficulty scaling based on map size
    adjustDifficultyForMapSize();
  };
  
  // Improve grid click handling to be more responsive
  window.handleGridClick = function(e) {
    // Debounce click handling to prevent accidental double clicks
    if (window.lastClickTime && (Date.now() - window.lastClickTime < 300)) {
      return;
    }
    window.lastClickTime = Date.now();
    
    // Call original handler
    originalHandleGridClick.call(this, e);
  };
  
  // =============================================
  // NEW FEATURES AND ENHANCEMENTS
  // =============================================
  
  // Add sound effects system
  function initAudioSystem() {
    window.gameAudio = {
      enabled: true,
      sounds: {},
      
      // Initialize sound effects
      init: function() {
        // Define sound effects (will be lazy-loaded)
        this.soundDefs = {
          click: { url: 'sounds/click.mp3' },
          build: { url: 'sounds/build.mp3' },
          error: { url: 'sounds/error.mp3' },
          success: { url: 'sounds/success.mp3' },
          nextTurn: { url: 'sounds/next-turn.mp3' },
          dogPet: { url: 'sounds/dog.mp3' }
        };
        
        // Add volume control to sidebar
        this.addVolumeControl();
      },
      
      // Play sound (lazy-loading if needed)
      play: function(soundName) {
        if (!this.enabled) return;
        
        // Create sound if it doesn't exist
        if (!this.sounds[soundName] && this.soundDefs[soundName]) {
          try {
            // In a real implementation, we would create the Audio object here
            // We'll simulate this for the example
            this.sounds[soundName] = { 
              play: function() { console.log(`Playing sound: ${soundName}`); }
            };
          } catch (e) {
            console.error("Failed to load sound:", e);
            return;
          }
        }
        
        // Play the sound if it exists
        if (this.sounds[soundName]) {
          this.sounds[soundName].play();
        }
      },
      
      // Add volume control to sidebar
      addVolumeControl: function() {
        const sidebar = document.getElementById('sidebar');
        const volumeControl = document.createElement('div');
        volumeControl.innerHTML = `
          <h3>Sound</h3>
          <label>
            <input type="checkbox" id="sound-toggle" ${this.enabled ? 'checked' : ''}>
            Enable sound
          </label>
        `;
        sidebar.appendChild(volumeControl);
        
        // Add event listener
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
          this.enabled = e.target.checked;
        });
      }
    };
    
    // Initialize audio system
    window.gameAudio.init();
  }
  
  // Add keyboard controls for accessibility
  function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      // Skip if an input is focused
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case 'n':
          // Next turn
          if (!document.getElementById('next-turn').disabled) {
            nextTurn();
          }
          break;
        case 'Escape':
          // Cancel selection or close menu
          if (gameState.selectedNode) {
            gameState.selectedNode = null;
            renderMap();
          }
          document.getElementById('context-menu').style.display = 'none';
          break;
        case 'h':
          // Show help
          showHowToPlay();
          break;
      }
    });
    
    // Add keyboard hint to instructions
    const instructions = document.getElementById('instructions');
    const keyboardHints = document.createElement('div');
    keyboardHints.innerHTML = `
      <h3>Keyboard Shortcuts:</h3>
      <p>N - Next turn</p>
      <p>ESC - Cancel selection</p>
      <p>H - Show help</p>
    `;
    instructions.appendChild(keyboardHints);
  }
  
  // Add save/load game functionality
  function setupSaveLoadSystem() {
    // Add save/load buttons to sidebar
    const sidebar = document.getElementById('sidebar');
    const saveLoadControls = document.createElement('div');
    saveLoadControls.innerHTML = `
      <h3>Game Data</h3>
      <button id="save-game">Save Game</button>
      <button id="load-game">Load Game</button>
    `;
    sidebar.appendChild(saveLoadControls);
    
    // Add event listeners
    document.getElementById('save-game').addEventListener('click', saveGame);
    document.getElementById('load-game').addEventListener('click', loadGame);
  }
  
  // Save game state to localStorage
  function saveGame() {
    try {
      // Deep clone gameState, removing circular references
      const gameStateCopy = JSON.parse(JSON.stringify(gameState, (key, value) => {
        // Skip circular references (like parent references)
        if (key === 'parent' || key === 'children') return undefined;
        return value;
      }));
      
      // Save to localStorage
      localStorage.setItem('nodez_save', JSON.stringify({
        gameState: gameStateCopy,
        timestamp: Date.now(),
        gridWidth: GRID_WIDTH,
        gridHeight: GRID_HEIGHT
      }));
      
      setStatusMessage("Game saved successfully!");
      if (window.gameAudio) window.gameAudio.play('success');
    } catch (e) {
      console.error("Failed to save game:", e);
      setStatusMessage("Failed to save game.");
      if (window.gameAudio) window.gameAudio.play('error');
    }
  }
  
  // Load game state from localStorage
  function loadGame() {
    try {
      const saveData = JSON.parse(localStorage.getItem('nodez_save'));
      if (!saveData) {
        setStatusMessage("No saved game found.");
        if (window.gameAudio) window.gameAudio.play('error');
        return;
      }
      
      // Restore grid dimensions
      GRID_WIDTH = saveData.gridWidth;
      GRID_HEIGHT = saveData.gridHeight;
      
      // Restore game state
      Object.assign(gameState, saveData.gameState);
      
      // Refresh UI
      updateSidebar();
      renderMap();
      
      setStatusMessage("Game loaded successfully!");
      if (window.gameAudio) window.gameAudio.play('success');
    } catch (e) {
      console.error("Failed to load game:", e);
      setStatusMessage("Failed to load game.");
      if (window.gameAudio) window.gameAudio.play('error');
    }
  }
  
  // =============================================
  // GAME BALANCE AND OPTIMIZATION
  // =============================================
  
  // Ensure resources aren't trapped by obstacles
  function ensureAccessibleResources() {
    for (const resource of gameState.resources) {
      // Check surrounding tiles
      let accessibleTiles = 0;
      
      // Check cardinal directions
      const directions = [
        {x: resource.x-1, y: resource.y},
        {x: resource.x+1, y: resource.y},
        {x: resource.x, y: resource.y-1},
        {x: resource.x, y: resource.y+1}
      ];
      
      for (const dir of directions) {
        if (dir.x < 0 || dir.x >= GRID_WIDTH || dir.y < 0 || dir.y >= GRID_HEIGHT) {
          continue;
        }
        
        // Count as accessible if empty or node
        const cell = gameState.grid[dir.y][dir.x];
        if (cell === "." || cell === "N" || cell === "P") {
          accessibleTiles++;
        }
      }
      
      // If resource is surrounded by obstacles, clear one adjacent tile
      if (accessibleTiles === 0) {
        // Choose a random direction
        const dir = directions[Math.floor(Math.random() * directions.length)];
        if (dir.x >= 0 && dir.x < GRID_WIDTH && dir.y >= 0 && dir.y < GRID_HEIGHT) {
gameState.grid[dir.y][dir.x] = "."; // Clear the obstacle
          console.log(`Cleared obstacle at ${dir.x},${dir.y} to make resource accessible`);
        }
      }
    }
  }
  
  // Adjust difficulty based on map size
  function adjustDifficultyForMapSize() {
    // Calculate map area
    const mapArea = GRID_WIDTH * GRID_HEIGHT;
    
    // Adjust starting money and costs based on map size
    if (mapArea > 1000) {
      // For larger maps, increase starting resources
      gameState.money = Math.floor(GAME_CONFIG.STARTING_MONEY * 1.5);
      gameState.movesRemaining = Math.floor(GAME_CONFIG.STARTING_MOVES * 1.5);
    } else if (mapArea < 400) {
      // For smaller maps, decrease some costs
      gameState.taxRate = Math.floor(gameState.taxRate * 0.8);
    }
    
    // Adjust resource and node distribution
    const resourceRatio = mapArea / 800; // Base map area reference
    const adjustedResourceCount = Math.max(3, Math.min(8, Math.floor(GAME_CONFIG.RESOURCE_COUNT * resourceRatio)));
    const adjustedNodeCount = Math.max(6, Math.min(20, Math.floor(GAME_CONFIG.NODE_COUNT * resourceRatio)));
    
    // If we already generated too many resources/nodes, trim the excess
    while (gameState.resources.length > adjustedResourceCount) {
      gameState.resources.pop();
    }
    
    while (gameState.nodes.length > adjustedNodeCount) {
      const nodeToRemove = gameState.nodes.pop();
      // Also remove from grid
      if (nodeToRemove) {
        gameState.grid[nodeToRemove.y][nodeToRemove.x] = ".";
      }
    }
    
    // Update status message with difficulty adjustment
    setStatusMessage(`Game initialized with ${gameState.resources.length} resources and ${gameState.nodes.length} nodes.`);
  }
  
  // =============================================
  // ACCESSIBILITY ENHANCEMENTS
  // =============================================
  
  // Add high contrast mode
  function addHighContrastMode() {
    const sidebar = document.getElementById('sidebar');
    const accessibilityControls = document.createElement('div');
    accessibilityControls.innerHTML = `
      <h3>Accessibility</h3>
      <label>
        <input type="checkbox" id="high-contrast-toggle">
        High Contrast Mode
      </label>
      <label>
        <input type="checkbox" id="large-text-toggle">
        Larger Text
      </label>
    `;
    sidebar.appendChild(accessibilityControls);
    
    // Add event listeners
    document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('high-contrast', e.target.checked);
      renderMap(); // Re-render with new colors
    });
    
    document.getElementById('large-text-toggle').addEventListener('change', (e) => {
      document.body.classList.toggle('large-text', e.target.checked);
      renderMap(); // Re-render with new font size
    });
    
    // Add CSS for high contrast and large text modes
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      body.high-contrast {
        --background-color: #000;
        --text-color: #fff;
        --accent-color: #ffff00;
        --success-color: #00ff00;
        --error-color: #ff0000;
      }
      
      body.large-text #ascii-display {
        font-size: 20px;
        line-height: 20px;
      }
      
      body.large-text #sidebar {
        font-size: 16px;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Extend renderMap to support high contrast mode
  const originalSetCellColor = window.setCellColor;
  window.setCellColor = function(cell) {
    const isHighContrast = document.body.classList.contains('high-contrast');
    
    if (isHighContrast) {
      // High contrast color scheme
      switch(cell) {
        case 'T': return 'lime'; // Trees
        case 'R': return 'yellow'; // Rocks
        case 'M': return 'orange'; // Mountains
        case '~': return 'cyan'; // Water
        case 'r': return 'magenta'; // Resource
        case 'N': return 'white'; // Normal node
        case 'P': return 'red'; // Player's starting node
        case '#': return 'cyan'; // Roads
        case '=': return 'yellow'; // Highways
        case '@': return 'orange'; // Refineries
        case 'F': return 'lime'; // Factories
        case 'D': return 'magenta'; // Dog
        default: return null;
      }
    } else {
      // Original colors
      return originalSetCellColor.call(this, cell);
    }
  };
  
  // Add screen reader assistance
  function addScreenReaderAssistance() {
    // Create an aria-live region for announcements
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('id', 'screen-reader-announcer');
    announcer.style.position = 'absolute';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    announcer.style.clip = 'rect(0,0,0,0)';
    document.body.appendChild(announcer);
    
    // Helper to announce messages to screen readers
    window.announceToScreenReader = function(message) {
      const announcer = document.getElementById('screen-reader-announcer');
      if (announcer) {
        announcer.textContent = message;
      }
    };
    
    // Extend status message function to also announce to screen reader
    const originalSetStatusMessage = window.setStatusMessage;
    window.setStatusMessage = function(message) {
      originalSetStatusMessage.call(this, message);
      announceToScreenReader(message);
    };
    
    // Add aria-labels to important UI elements
    document.querySelectorAll('button, input, select').forEach(el => {
      if (!el.getAttribute('aria-label')) {
        el.setAttribute('aria-label', el.textContent || el.value || el.id || 'game control');
      }
    });
  }
  
  // =============================================
  // INITIALIZE ENHANCEMENTS
  // =============================================
  
  // Call our new enhancement functions
  addHighContrastMode();
  addScreenReaderAssistance();
  
  console.log('NODEZ Enhancement Module fully loaded');
}