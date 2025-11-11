const FEATURE_FLAG_KEY = 'word_search_difficulty_v2';

// DOM helpers (now loaded globally from utils.js)
// $ show hide toggle formatTime

const generateUsername = () => {
  // Use the global function from username-generator.js module
  if (typeof window.generateRandomUsername === 'function') {
    return window.generateRandomUsername();
  }
  // Fallback if module hasn't loaded yet
  return 'Player ' + Math.floor(Math.random() * 1000);
};

let puzzleState = {
  variant: null,
  puzzleConfig: null, // Store the selected puzzle configuration
  startTime: null,
  isRunning: false,
  timerInterval: null,
  completionTime: null,
  // Memory game specific state
  isMemorizing: false,
  foundPineapples: [],
  totalClicks: 0,
  gridState: [] // Track revealed tiles
};

document.addEventListener('DOMContentLoaded', () => {
  // Wait for PostHog feature flags; add a single retry before erroring
  if (typeof posthog !== 'undefined' && posthog.onFeatureFlags) {
    posthog.onFeatureFlags(() => {
      const ok = initializeVariant();
      if (ok) {
        displayVariant();
        setupPuzzle();
        updateLeaderboard();
      } else {
        setTimeout(() => {
          const okRetry = initializeVariant();
          if (okRetry) {
            displayVariant();
            setupPuzzle();
            updateLeaderboard();
          } else {
            console.error('PostHog feature flag not resolved after retry.');
            showFeatureFlagError();
          }
        }, 500);
      }
    });
  } else {
    // PostHog not loaded - show error
    console.error('PostHog not initialized. Check environment variables.');
    showFeatureFlagError();
  }
});

const initializeVariant = () => {
  // Get variant from PostHog feature flag
  if (typeof posthog === 'undefined') return false;
  const posthogVariant = posthog.getFeatureFlag(FEATURE_FLAG_KEY);

  let variant = null;
  if (posthogVariant === '4-words') {
    variant = 'B';  // 4 words = Variant B
  } else if (posthogVariant === 'control') {
    variant = 'A';  // control = Variant A (3 words)
  } else {
    // Feature flag not resolved yet
    return false;
  }

  localStorage.setItem('simulator_variant', variant);

  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('simulator_user_id', userId);

  if (!localStorage.getItem('simulator_username')) {
    const username = generateUsername();
    localStorage.setItem('simulator_username', username);
    // Identify user in PostHog with their username
    if (typeof posthog !== 'undefined' && posthog.identify) {
      posthog.identify(username);
    }
  }

  return true;
};

const showFeatureFlagError = () => {
  const errorHTML = `
    <div class="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950 mb-4">
      <div class="flex items-start gap-2">
        <div class="text-lg">⚠️</div>
        <div class="flex-1">
          <h3 class="font-semibold text-red-900 dark:text-red-100 text-sm">PostHog Feature Flag Error</h3>
          <p class="text-xs text-red-800 dark:text-red-200 mt-1">Feature flag "${FEATURE_FLAG_KEY}" failed to load. Check PostHog configuration.</p>
        </div>
      </div>
    </div>
  `;
  
  const challengeSection = $('challenge-section');
  if (challengeSection) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = errorHTML;
    challengeSection.parentNode.insertBefore(errorDiv, challengeSection);
  }
};


const displayVariant = () => {
  const variant = localStorage.getItem('simulator_variant');
  if (!variant) {
    // Feature flag failed to load
    $('user-variant').textContent = 'Error';
    $('user-username').textContent = 'Feature flag failed';
    $('difficulty-display').textContent = 'Check PostHog config';
    $('target-word-count').textContent = '0';
    return;
  }
  
  puzzleState.variant = variant;
  const username = localStorage.getItem('simulator_username');
  
  // Get a random puzzle with shuffled letters for this variant
  const config = window.PuzzleConfig.getPuzzleForVariant(variant);
  puzzleState.puzzleConfig = config;
  
  $('user-variant').textContent = `Variant ${variant} | ${config.id}`;
  $('user-username').textContent = username || 'Loading...';
  $('difficulty-display').textContent = `Difficulty: ${config.difficulty}/10`;
  $('target-word-count').textContent = config.targetCount;
  
  // Setup puzzle while we're at it
  const puzzleSection = $('puzzle-section');
  puzzleSection.classList.toggle('variant-a-theme', variant === 'A');
  puzzleSection.classList.toggle('variant-b-theme', variant === 'B');
  
  // Create 5x5 grid for memory game with always visible grey boxes
  const gridHTML = config.grid.map((row, rowIndex) => 
    row.map((fruit, colIndex) => 
      `<div class="aspect-square rounded-lg bg-gray-600 flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden memory-tile border-2 border-gray-500 hover:!bg-orange-500 hover:!border-orange-600 hover:scale-105" data-row="${rowIndex}" data-col="${colIndex}" data-fruit="${fruit}">
        <span class="text-2xl transition-all duration-300 fruit-emoji opacity-0 scale-80">${fruit}</span>
      </div>`
    ).join('')
  ).join('');
  $('letter-grid').innerHTML = gridHTML;
};

const setupPuzzle = () => {
  const variant = localStorage.getItem('simulator_variant');
  if (!variant) {
    // Feature flag failed - disable start button
    const startButton = $('start-button');
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = 'Feature Flag Error';
      startButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return;
  }
  
  $('start-button').addEventListener('click', startChallenge);
  $('reset-button').addEventListener('click', resetPuzzle);
  document.querySelectorAll('.try-again-button').forEach(btn => btn.addEventListener('click', resetPuzzle));
  
  // Add click handlers for memory tiles
  document.querySelectorAll('.memory-tile').forEach(tile => {
    tile.addEventListener('click', handleTileClick);
  });
};

const startChallenge = () => {
  puzzleState.isRunning = true;
  puzzleState.isMemorizing = true;
  // Reset per-run collections
  puzzleState.foundPineapples = [];
  puzzleState.totalClicks = 0;
  puzzleState.gridState = Array(5).fill(null).map(() => Array(5).fill(false));
  
  // Show all fruits for memorization
  document.querySelectorAll('.memory-tile').forEach(tile => {
    tile.classList.remove('bg-gray-800', 'bg-green-600', 'bg-red-600');
    tile.classList.add('bg-green-600', 'scale-105');
    tile.querySelector('.fruit-emoji').classList.remove('opacity-0', 'scale-80');
    tile.querySelector('.fruit-emoji').classList.add('opacity-100', 'scale-100');
  });
  
  // Show memorize message
  $('start-button').classList.add('hidden');
  $('memorize-message').classList.remove('hidden');
  
  // Start countdown timer after 2 seconds
  setTimeout(() => {
    $('memorize-message').classList.add('hidden');
    startCountdownTimer();
  }, 2000);
  
  trackEvent('puzzle_started', { 
    difficulty: puzzleState.puzzleConfig.difficulty,
    puzzle_id: puzzleState.puzzleConfig.id
  });
};

const startCountdownTimer = () => {
  let countdown = 5;
  $('countdown-timer').classList.remove('hidden');
  $('countdown-number').textContent = countdown;
  
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      $('countdown-number').textContent = countdown;
    } else {
      clearInterval(countdownInterval);
      $('countdown-number').textContent = 'HIDE';
      
      setTimeout(() => {
        $('countdown-timer').classList.add('hidden');
        puzzleState.isMemorizing = false;
        startGamePhase();
      }, 1000);
    }
  }, 1000);
};

const startGamePhase = () => {
  // Start the 60-second timer now
  puzzleState.startTime = Date.now();
  
  // Hide all fruits
  document.querySelectorAll('.memory-tile').forEach(tile => {
    tile.classList.remove('bg-green-600', 'scale-105');
    tile.classList.add('bg-gray-800');
    tile.querySelector('.fruit-emoji').classList.remove('opacity-100', 'scale-100');
    tile.querySelector('.fruit-emoji').classList.add('opacity-0', 'scale-80');
  });
  
  // Hide memorize message, show game elements
  $('memorize-message').classList.add('hidden');
  $('reset-button').classList.remove('hidden');
  
  // Start game timer
  puzzleState.timerInterval = setInterval(updateTimer, 100);
};

const updateTimer = () => {
  const elapsed = Date.now() - puzzleState.startTime;
  if (elapsed >= 60000) {
    endChallenge(false);
    return;
  }
  $('timer').textContent = formatTime(60000 - elapsed);
};

const handleTileClick = (event) => {
  if (!puzzleState.isRunning || puzzleState.isMemorizing) return;
  
  const tile = event.currentTarget;
  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);
  const fruit = tile.dataset.fruit;
  
  // Don't allow clicking already revealed tiles
  if (puzzleState.gridState[row][col]) return;
  
  puzzleState.totalClicks++;
  puzzleState.gridState[row][col] = true;
  
  if (fruit === '🍍') {
    // Correct pineapple found
    puzzleState.foundPineapples.push([row, col]);
    tile.classList.remove('bg-gray-800');
    tile.classList.add('bg-green-600', 'scale-105');
    tile.querySelector('.fruit-emoji').classList.remove('opacity-0', 'scale-80');
    tile.querySelector('.fruit-emoji').classList.add('opacity-100', 'scale-100');
    
    // Update found count display
    $('found-pineapples-list').textContent = `${puzzleState.foundPineapples.length}/${puzzleState.puzzleConfig.targetCount}`;
    
    // Check if all pineapples found
    if (puzzleState.foundPineapples.length === puzzleState.puzzleConfig.targetCount) {
      endChallenge(true);
    }
  } else {
    // Incorrect guess
    tile.classList.remove('bg-gray-800');
    tile.classList.add('bg-red-600', 'animate-pulse');
    tile.querySelector('.fruit-emoji').classList.remove('opacity-0', 'scale-80');
    tile.querySelector('.fruit-emoji').classList.add('opacity-100', 'scale-100');
    
    // Show incorrect briefly, then hide again
    setTimeout(() => {
      tile.classList.remove('bg-red-600', 'animate-pulse');
      tile.classList.add('bg-gray-800');
      tile.querySelector('.fruit-emoji').classList.remove('opacity-100', 'scale-100');
      tile.querySelector('.fruit-emoji').classList.add('opacity-0', 'scale-80');
      puzzleState.gridState[row][col] = false; // Allow clicking again
    }, 1000);
  }
};

// Removed legacy word-search support function (updateFoundWordsList)

const endChallenge = async (success) => {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.completionTime = success ? Date.now() - puzzleState.startTime : 60000;
  
  // Hide everything challenge-related, show result
  // Removed legacy input-section (word search mechanic)
  $('reset-button').classList.add('hidden');
  document.querySelectorAll('.try-again-button').forEach(btn => btn.classList.remove('hidden'));
  $('result-card').classList.remove('hidden');
  
  const statusBadge = $('result-card').querySelector('.inline-flex');
  const emojiSpan = statusBadge.querySelector('.text-xl');
  const statusTitle = statusBadge.querySelector('.text-xs');
  
  if (success) {
    const isPersonalBest = updateLeaderboard(puzzleState.completionTime, puzzleState.variant);
    $('result-time').textContent = formatTime(puzzleState.completionTime);
    $('result-guesses').textContent = puzzleState.totalClicks;
  $('result-guesses').textContent = puzzleState.totalClicks;
    $('result-message').innerHTML = isPersonalBest ? '🏆 Personal Best!' : '✓ Complete!';
    
    // Green success styling
    $('result-card').classList.remove('border-red-200', 'bg-red-50', 'dark:border-red-900', 'dark:bg-red-950');
    $('result-card').classList.add('border-green-200', 'bg-green-50', 'dark:border-green-900', 'dark:bg-green-950');
    statusBadge.classList.remove('border-red-200', 'dark:border-red-900');
    statusBadge.classList.add('border-green-200', 'dark:border-green-900');
    emojiSpan.textContent = '🎉';
    statusTitle.textContent = 'Challenge Complete';
  } else {
    $('result-time').textContent = '00:60:00';
    $('result-guesses').textContent = `${puzzleState.foundPineapples.length}/${puzzleState.puzzleConfig.targetCount}`;
    $('result-message').innerHTML = '⏰ Time\'s up!';
    
    // Red failure styling
    $('result-card').classList.remove('border-green-200', 'bg-green-50', 'dark:border-green-900', 'dark:bg-green-950');
    $('result-card').classList.add('border-red-200', 'bg-red-50', 'dark:border-red-900', 'dark:bg-red-950');
    statusBadge.classList.remove('border-green-200', 'dark:border-green-900');
    statusBadge.classList.add('border-red-200', 'dark:border-red-900');
    emojiSpan.textContent = '😞';
    statusTitle.textContent = 'Challenge Failed';
  }
  
  trackEvent(success ? 'puzzle_completed' : 'puzzle_failed', { 
    // Ensure numeric type for downstream analytics (avoid string via toFixed)
    completion_time_seconds: success ? Math.round((puzzleState.completionTime) / 1) / 1000 : undefined,
    correct_words_count: puzzleState.foundPineapples.length, // Track pineapples found
    total_guesses_count: puzzleState.totalClicks // Track total clicks
  });
};

const resetPuzzle = (isRepeat = false) => {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.startTime = null;
  // Reset state collections
  puzzleState.foundPineapples = [];
  puzzleState.totalClicks = 0;
  puzzleState.gridState = [];
  puzzleState.completionTime = null;
  
  $('timer').textContent = '00:60:00';
  $('found-pineapples-list').textContent = '0';
  
  // Reset grid tiles
  document.querySelectorAll('.memory-tile').forEach(tile => {
    tile.classList.remove('bg-green-600', 'bg-red-600', 'bg-gray-800', 'scale-105', 'animate-pulse');
    tile.classList.add('bg-gray-700');
    tile.querySelector('.fruit-emoji').classList.remove('opacity-100', 'scale-100');
    tile.querySelector('.fruit-emoji').classList.add('opacity-0', 'scale-80');
  });
  
  // Reset to initial state: show start button, hide everything else
  $('start-button').classList.remove('hidden');
  $('reset-button').classList.add('hidden');
  $('memorize-message').classList.add('hidden');
  $('countdown-timer').classList.add('hidden');
  document.querySelectorAll('.try-again-button').forEach(btn => btn.classList.add('hidden'));
  $('result-card').classList.add('hidden');
  
  if (isRepeat) trackEvent('puzzle_repeated', {});
};

const trackEvent = (eventName, props = {}) => {
  try {
    // PostHog will be available globally if script loaded
    if (!posthog?.capture) return;
    
    posthog.capture(eventName, {
      variant: puzzleState.variant,
      username: localStorage.getItem('simulator_username'),
      $feature_flag: FEATURE_FLAG_KEY,
      $feature_flag_response: posthog.getFeatureFlag(FEATURE_FLAG_KEY),
      user_id: localStorage.getItem('simulator_user_id'),
      ...props
    });
  } catch (e) {
    console.error('PostHog error:', e);
  }
};


const fetchAndDisplayLeaderboard = async (variant) => {
  const leaderboardList = $('leaderboard-list');
  const username = localStorage.getItem('simulator_username');
  
  try {
    const response = await fetch(`https://soma-analytics.fly.dev/api/leaderboard?variant=${variant}&limit=10`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      leaderboardList.innerHTML = '<p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 0.75rem; margin: 0; padding: 1rem 0;">Complete to rank</p>';
      return;
    }
    
    // Find user's best time in the full data
    const userBest = data.find(entry => entry.username === username);
    const userRank = data.findIndex(entry => entry.username === username) + 1;
    
    // Display top 5
    let html = data.slice(0, 5).map((entry, i) => {
      const isCurrentUser = entry.username === username;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
      const highlight = isCurrentUser ? ' bg-blue-50 dark:bg-blue-950 border-l-2 border-blue-500 pl-2' : '';
      return `<div class="flex items-center justify-between py-1.5${highlight}"><span class="font-mono text-xs"><span style="display:inline-block;width:1.5rem;">${medal}</span> ${entry.username}${isCurrentUser ? ' 🌟' : ''}</span><span style="font-weight: 600; color: #3b82f6;">${entry.best_time.toFixed(2)}s</span></div>`;
    }).join('');
    
    // If user has a time but is not in top 5, show their best below
    if (userBest && userRank > 5) {
      html += `<div style="border-top: 1px solid #d1d5db; margin-top: 0.5rem; padding-top: 0.5rem;"><div class="flex items-center justify-between py-1.5 bg-blue-50 dark:bg-blue-950 border-l-2 border-blue-500 pl-2"><span class="font-mono text-xs"><span style="display:inline-block;width:1.5rem;">${userRank}.</span> ${userBest.username} 🌟</span><span style="font-weight: 600; color: #3b82f6;">${userBest.best_time.toFixed(2)}s</span></div></div>`;
    }
    
    leaderboardList.innerHTML = html;
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    leaderboardList.innerHTML = '<p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 0.75rem; margin: 0; padding: 1rem 0;">Loading...</p>';
  }
};

const updateLeaderboard = (currentTime = null, currentVariant = null) => {
  // Fetch leaderboard data immediately
  const variant = currentVariant || localStorage.getItem('simulator_variant');
  if (!variant) return false; // No variant means feature flag failed
  fetchAndDisplayLeaderboard(variant);
  return currentTime !== null;
};
