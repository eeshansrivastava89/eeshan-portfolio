const FEATURE_FLAG_KEY = 'word_search_difficulty_v2';
const PUZZLE_CONFIG = {
  A: { letters: ['M','A','T','H','E','M','A','T','I','C','S','L','O','W'], targetWords: ['MATH','THEM','MACE'], difficulty: 3, targetCount: 3 },
  B: { letters: ['C','O','M','P','U','T','E','R','S','C','I','E','N','C','E','D','A','T','A'], targetWords: ['COMP','PURE','ENCE','DATA'], difficulty: 5, targetCount: 4 }
};
const ADJECTIVES = ['Lightning','Swift','Quick','Speedy','Rapid','Fast','Blazing','Turbo','Sonic','Flash'];
const ANIMALS = ['Leopard','Cheetah','Falcon','Hawk','Fox','Wolf','Tiger','Eagle','Panther','Gazelle'];

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
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
};

let puzzleState = {
  variant: null, startTime: null, isRunning: false, guessedWords: [], foundWords: [], 
  timerInterval: null, completionTime: null
};

document.addEventListener('DOMContentLoaded', () => {
  let hasInitialized = false;
  const doInit = () => {
    if (hasInitialized) return;
    hasInitialized = true;
    initializeVariant();
    displayVariant();
    setupPuzzle();
    updateLeaderboard();
  };
  // Only use PostHog if it's loaded
  if (typeof window !== 'undefined' && typeof window.posthog !== 'undefined' && window.posthog?.onFeatureFlags) {
    window.posthog.onFeatureFlags(doInit);
  }
  setTimeout(doInit, 1000);
});

const initializeVariant = () => {
  let variant = 'A';
  let flagResponse = null;
  
  // Try to get feature flag from PostHog - check window object first
  if (typeof window !== 'undefined' && window.posthog) {
    let flag = null;
    
    // Method 1: getFeatureFlag (newer versions)
    if (typeof window.posthog.getFeatureFlag === 'function') {
      flag = window.posthog.getFeatureFlag(FEATURE_FLAG_KEY);
    }
    // Method 2: featureFlags object (some versions)
    else if (window.posthog.featureFlags && window.posthog.featureFlags[FEATURE_FLAG_KEY] !== undefined) {
      flag = window.posthog.featureFlags[FEATURE_FLAG_KEY];
    }
    
    console.log(`PostHog flag "${FEATURE_FLAG_KEY}":`, flag); // Debug log
    
    if (flag === '4-words') {
      variant = 'B';
      flagResponse = '4-words';
    } else if (flag === 'control') {
      variant = 'A';
      flagResponse = 'control';
    } else {
      // No feature flag from PostHog, randomize
      variant = Math.random() < 0.5 ? 'A' : 'B';
      flagResponse = null; // No flag response since not from PostHog
    }
  } else {
    // PostHog not loaded, random variant
    variant = Math.random() < 0.5 ? 'A' : 'B';
    flagResponse = null;
  }
  
  localStorage.setItem('simulator_variant', variant);
  localStorage.setItem('simulator_flag_response', flagResponse || '');
  localStorage.setItem('simulator_user_id', 'user_' + Math.random().toString(36).substr(2, 9));
  if (!localStorage.getItem('simulator_username')) {
    localStorage.setItem('simulator_username', generateUsername());
  }
};


const displayVariant = () => {
  const variant = localStorage.getItem('simulator_variant');
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
  $('start-button').addEventListener('click', startChallenge);
  $('reset-button').addEventListener('click', resetPuzzle);
  $('try-again-inline-button').addEventListener('click', resetPuzzle);
  $('try-again-button').addEventListener('click', resetPuzzle);
  $('try-again-failure-button').addEventListener('click', resetPuzzle);
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
  
  if (success) {
    const isPersonalBest = updateLeaderboard(puzzleState.completionTime, puzzleState.variant);
    $('result-time').textContent = formatTime(puzzleState.completionTime);
    $('result-guesses').textContent = puzzleState.guessedWords.length;
    $('result-message').innerHTML = isPersonalBest ? '🏆 Personal Best!' : '✓ Complete!';
    $('result-card').classList.remove('border-red-200', 'bg-red-50', 'dark:border-red-900', 'dark:bg-red-950');
    $('result-card').classList.add('border-green-200', 'bg-green-50', 'dark:border-green-900', 'dark:bg-green-950');
  } else {
    $('result-time').textContent = '00:60:00';
    $('result-guesses').textContent = puzzleState.foundWords.length + '/' + PUZZLE_CONFIG[puzzleState.variant].targetCount;
    $('result-message').innerHTML = '⏰ Time\'s up!';
    $('result-card').classList.remove('border-green-200', 'bg-green-50', 'dark:border-green-900', 'dark:bg-green-950');
    $('result-card').classList.add('border-red-200', 'bg-red-50', 'dark:border-red-900', 'dark:bg-red-950');
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
  $('completion-message').classList.add('hidden');
  $('failure-message').classList.add('hidden');
  
  if (isRepeat) trackEvent('puzzle_repeated', {});
};

const trackEvent = (eventName, props = {}) => {
  const flagResponse = localStorage.getItem('simulator_flag_response');
  
  // Only track if we have a valid feature flag response
  if (!flagResponse) {
    console.warn(`Skipping event "${eventName}" - no feature flag response loaded. Feature flag not properly initialized in PostHog.`);
    return;
  }
  
  if (typeof window === 'undefined' || !window.posthog?.capture) return;
  try {
    window.posthog.capture(eventName, {
      variant: puzzleState.variant,
      $feature_flag_response: flagResponse,
      user_id: localStorage.getItem('simulator_user_id'),
      ...props
    });
  } catch (e) {
    console.error('PostHog error:', e);
  }
};


const updateLeaderboard = (currentTime = null, currentVariant = null) => {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  const leaderboardList = $('leaderboard-list');
  let isPersonalBest = false;

  if (currentTime && currentVariant) {
    const username = localStorage.getItem('simulator_username');
    const timeInSeconds = currentTime / 1000;
    const existingIndex = leaderboard.findIndex(e => e.username === username);

    if (existingIndex >= 0) {
      if (timeInSeconds < leaderboard[existingIndex].time) {
        leaderboard[existingIndex] = { username, time: timeInSeconds, variant: currentVariant };
        isPersonalBest = true;
      }
    } else {
      leaderboard.push({ username, time: timeInSeconds, variant: currentVariant });
      isPersonalBest = true;
    }
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }
  
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<p style="text-align: center; color: #9ca3af; font-style: italic; font-size: 0.75rem; margin: 0; padding: 1rem 0;">Complete to rank</p>';
    return isPersonalBest;
  }
  
  leaderboard.sort((a, b) => a.time - b.time);
  const username = localStorage.getItem('simulator_username');
  const top5 = leaderboard.slice(0, 5);
  
  let html = top5.map((entry, i) => {
    const isCurrentUser = entry.username === username;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 + '.';
    const highlight = isCurrentUser ? ' bg-blue-50 dark:bg-blue-950 border-l-2 border-blue-500 pl-2' : '';
    return `<div class="flex items-center justify-between py-1.5${highlight}"><span class="font-mono text-xs"><span style="display:inline-block;width:1.5rem;">${medal}</span> ${entry.username}${isCurrentUser ? ' 🌟' : ''}</span><span style="font-weight: 600; color: #3b82f6;">${entry.time.toFixed(2)}s</span></div>`;
  }).join('');
  
  // Add current attempt if it's slower than personal best
  if (currentTime) {
    const timeInSeconds = currentTime / 1000;
    const userBest = leaderboard.find(e => e.username === username);
    if (userBest && timeInSeconds > userBest.time) {
      html += `<div style="border-top: 1px solid #d1d5db; margin-top: 0.5rem; padding-top: 0.5rem;"><div class="flex items-center justify-between py-1.5"><span class="font-mono text-xs" style="color: #9ca3af;">↳ Your current time</span><span style="font-weight: 600; color: #f59e0b;">${timeInSeconds.toFixed(2)}s</span></div></div>`;
    }
  }
  
  leaderboardList.innerHTML = html;
  return isPersonalBest;
};
