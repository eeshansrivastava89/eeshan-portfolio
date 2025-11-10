const FEATURE_FLAG_KEY = 'word_search_difficulty_v2';
const PUZZLE_CONFIG = {
  A: { letters: ['M','A','T','H','E','M','A','T','I','C','S','L','O','W'], targetWords: ['MATH','THEM','MACE'], difficulty: 3, targetCount: 3 },
  B: { letters: ['C','O','M','P','U','T','E','R','S','C','I','E','N','C','E','D','A','T','A'], targetWords: ['COMP','PURE','ENCE','DATA'], difficulty: 5, targetCount: 4 }
};

const $ = (id) => document.getElementById(id);
const show = (...ids) => ids.forEach(id => $(id).classList.remove('hidden'));
const hide = (...ids) => ids.forEach(id => $(id).classList.add('hidden'));
const toggle = (id, show) => $(id).classList.toggle('hidden', !show);
const formatTime = (ms) => {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms2 = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(ms2).padStart(2, '0')}`;
};

const generateUsername = () => {
  // Use the global function from username-generator.js module
  if (typeof window.generateRandomUsername === 'function') {
    return window.generateRandomUsername();
  }
  // Fallback if module hasn't loaded yet
  return 'Player ' + Math.floor(Math.random() * 1000);
};

let puzzleState = {
  variant: null, startTime: null, isRunning: false, guessedWords: [], foundWords: [], 
  timerInterval: null, completionTime: null
};

document.addEventListener('DOMContentLoaded', () => {
  // Wait for PostHog feature flags to load before initializing
  if (typeof posthog !== 'undefined' && posthog.onFeatureFlags) {
    posthog.onFeatureFlags(() => {
      initializeVariant();
      displayVariant();
      setupPuzzle();
      updateLeaderboard();
    });
  } else {
    // PostHog not loaded - show error
    console.error('PostHog not initialized. Check environment variables.');
    showFeatureFlagError();
  }
});

const initializeVariant = () => {
  // Get variant from PostHog feature flag
  const posthogVariant = posthog.getFeatureFlag(FEATURE_FLAG_KEY);

  let variant;
  if (posthogVariant === '4-words') {
    variant = 'B';  // 4 words = Variant B
  } else if (posthogVariant === 'control') {
    variant = 'A';  // control = Variant A (3 words)
  } else {
    // Feature flag not loaded - show error and stop
    console.error('PostHog feature flag not resolved. Received:', posthogVariant);
    showFeatureFlagError();
    return;
  }

  localStorage.setItem('simulator_variant', variant);

  const userId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('simulator_user_id', userId);

  if (!localStorage.getItem('simulator_username')) {
    const username = generateUsername();
    localStorage.setItem('simulator_username', username);
    
    // Identify user in PostHog with their username
    if (typeof posthog !== 'undefined') {
      posthog.identify(username);
    }
  }
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
  const config = PUZZLE_CONFIG[variant];
  
  $('user-variant').textContent = 'Variant ' + variant;
  $('user-username').textContent = username || 'Loading...';
  $('difficulty-display').textContent = `Difficulty: ${config.difficulty}/10`;
  $('target-word-count').textContent = config.targetCount;
  
  // Setup puzzle while we're at it
  const puzzleSection = $('puzzle-section');
  puzzleSection.classList.toggle('variant-a-theme', variant === 'A');
  puzzleSection.classList.toggle('variant-b-theme', variant === 'B');
  
  $('letter-grid').innerHTML = config.letters.map(letter => `<div class="letter">${letter}</div>`).join('');
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
  $('try-again-inline-button').addEventListener('click', resetPuzzle);
  $('word-input').addEventListener('keypress', handleWordInput);
};

const startChallenge = () => {
  puzzleState.startTime = Date.now();
  puzzleState.isRunning = true;
  puzzleState.guessedWords = [];
  puzzleState.foundWords = [];
  
  // Show: timer is always visible, show input section and reset button
  $('input-section').classList.remove('hidden');
  $('reset-button').classList.remove('hidden');
  $('start-button').classList.add('hidden');
  
  $('word-input').focus();
  
  puzzleState.timerInterval = setInterval(updateTimer, 100);
  trackEvent('puzzle_started', { difficulty: PUZZLE_CONFIG[puzzleState.variant].difficulty });
};

const updateTimer = () => {
  const elapsed = Date.now() - puzzleState.startTime;
  if (elapsed >= 60000) {
    endChallenge(false);
    return;
  }
  $('timer').textContent = formatTime(60000 - elapsed);
};

const handleWordInput = event => {
  if (event.key !== 'Enter') return;
  
  const word = event.target.value.toUpperCase().trim();
  event.target.value = '';
  if (!word) return;
  
  const config = PUZZLE_CONFIG[puzzleState.variant];
  puzzleState.guessedWords.push(word);
  
  if (config.targetWords.includes(word) && !puzzleState.foundWords.includes(word)) {
    puzzleState.foundWords.push(word);
    $('found-words-list').textContent = puzzleState.foundWords.join(', ');
    if (puzzleState.foundWords.length === config.targetCount) endChallenge(true);
  } else {
    event.target.classList.add('shake-animate');
    setTimeout(() => event.target.classList.remove('shake-animate'), 500);
  }
};

const updateFoundWordsList = () => {
  const list = puzzleState.foundWords.join(', ');
  document.getElementById('found-words-list').textContent = list || '(none yet)';
};

const endChallenge = async (success) => {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.completionTime = success ? Date.now() - puzzleState.startTime : 60000;
  
  // Hide everything challenge-related, show result
  $('input-section').classList.add('hidden');
  $('reset-button').classList.add('hidden');
  $('try-again-inline-button').classList.remove('hidden');
  $('result-card').classList.remove('hidden');
  
  const statusBadge = $('result-card').querySelector('.inline-flex');
  const emojiSpan = statusBadge.querySelector('.text-xl');
  const statusTitle = statusBadge.querySelector('.text-xs');
  
  if (success) {
    const isPersonalBest = updateLeaderboard(puzzleState.completionTime, puzzleState.variant);
    $('result-time').textContent = formatTime(puzzleState.completionTime);
    $('result-guesses').textContent = puzzleState.guessedWords.length;
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
    $('result-guesses').textContent = puzzleState.foundWords.length + '/' + PUZZLE_CONFIG[puzzleState.variant].targetCount;
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
    completion_time_seconds: success ? (puzzleState.completionTime / 1000).toFixed(3) : undefined,
    correct_words_count: puzzleState.foundWords.length,
    total_guesses_count: puzzleState.guessedWords.length
  });
};

const resetPuzzle = (isRepeat = false) => {
  puzzleState.isRunning = false;
  clearInterval(puzzleState.timerInterval);
  puzzleState.startTime = null;
  puzzleState.guessedWords = [];
  puzzleState.foundWords = [];
  puzzleState.completionTime = null;
  
  $('timer').textContent = '00:60:00';
  $('word-input').value = '';
  $('found-words-list').textContent = '(none yet)';
  
  // Reset to initial state: show start button, hide everything else
  $('start-button').classList.remove('hidden');
  $('reset-button').classList.add('hidden');
  $('input-section').classList.add('hidden');
  $('try-again-inline-button').classList.add('hidden');
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
  // After completion, fetch fresh leaderboard data from API
  if (currentTime && currentVariant) {
    fetchAndDisplayLeaderboard(currentVariant);
    return true; // Always consider it notable since it's now global
  }
  
  // Initial load: fetch for current variant from localStorage
  const variant = localStorage.getItem('simulator_variant') || 'A';
  fetchAndDisplayLeaderboard(variant);
  return false;
};
