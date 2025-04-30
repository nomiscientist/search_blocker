// Content script for Search Result Blocker

console.log('Search Result Blocker content script loaded.');

let blockedWords = [];
let filterMode = 'hide'; // 'hide' or 'highlight'
let isEnabled = true;
let redirectRules = []; // To store redirect rules {keyword: '...', url: '...'}

// Function to escape special characters for regex
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Function to scan and filter/highlight results
function scanAndFilter() {
  if (!isEnabled) {
    // If disabled, potentially revert changes (e.g., unhide elements, remove highlights)
    // This needs careful implementation depending on how hiding/highlighting is done.
    console.log('Filtering disabled.');
    // Example: Remove previously added classes or styles
    document.querySelectorAll('.search-blocker-hidden, .search-blocker-highlight').forEach(el => {
        el.classList.remove('search-blocker-hidden', 'search-blocker-highlight');
        // Potentially restore original display style if hiding was done via style attribute
        if (el.dataset.originalDisplay) {
            el.style.display = el.dataset.originalDisplay;
            delete el.dataset.originalDisplay;
        }
    });
    return;
  }

  if (blockedWords.length === 0) {
    console.log('No words to block.');
    return;
  }

  console.log(`Scanning page with mode: ${filterMode}, words:`, blockedWords);

  // --- Define Selectors for Search Results --- 
  // These need to be specific to each search engine (Google, Bing, DuckDuckGo)
  // This is a simplified example; robust selectors are needed.
  const resultSelectors = [
    // Google: Needs refinement for modern Google layouts
    'div.g', // General container, might need more specific selectors
    'div.tF2Cxc', // Older selector
    // Bing:
    'li.b_algo',
    // DuckDuckGo:
    'div.result',
    'article[data-result]' // More modern DDG
  ];

  const elementsToScan = document.querySelectorAll(resultSelectors.join(', '));

  elementsToScan.forEach(element => {
    // Avoid processing elements already processed or nested results incorrectly
    if (element.classList.contains('search-blocker-processed')) return;
    element.classList.add('search-blocker-processed'); // Mark as processed

    const textContent = element.textContent || element.innerText || '';
    let matchFound = false;

    for (const word of blockedWords) {
      if (!word) continue; // Skip empty strings
      // Case-insensitive, whole word/phrase matching
      // Using word boundaries (\b) might be too restrictive for phrases or partial matches within words.
      // Consider options: simple includes, regex with word boundaries, etc.
      // Simple case-insensitive check for now:
      const regex = new RegExp(escapeRegex(word), 'i'); 

      if (regex.test(textContent)) {
        matchFound = true;
        console.log(`Match found for "${word}" in:`, element);

        if (filterMode === 'hide') {
          // Store original display style before hiding
          if (!element.dataset.originalDisplay) {
              element.dataset.originalDisplay = window.getComputedStyle(element).display;
          }
          element.style.display = 'none';
          element.classList.add('search-blocker-hidden');
          break; // Stop checking other words if hiding
        } else if (filterMode === 'highlight') {
          // Highlighting is more complex: needs to wrap matches without breaking HTML
          // Simple approach: add a class to the whole result block
          element.classList.add('search-blocker-highlight');
          // TODO: Implement more granular highlighting within the element's text nodes
        }
      }
    }

    // If highlighting, ensure elements that *don't* match aren't highlighted
    if (filterMode === 'highlight' && !matchFound) {
        element.classList.remove('search-blocker-highlight');
    }
    // If hiding, ensure elements that *don't* match are visible (if previously hidden)
    // This logic might need refinement based on how state is managed
    if (filterMode === 'hide' && !matchFound && element.classList.contains('search-blocker-hidden')) {
        if (element.dataset.originalDisplay) {
            element.style.display = element.dataset.originalDisplay;
        }
        element.classList.remove('search-blocker-hidden');
    }

  });

  // Reset processed marker for next scan (e.g., after AJAX load)
  setTimeout(() => {
      document.querySelectorAll('.search-blocker-processed').forEach(el => el.classList.remove('search-blocker-processed'));
  }, 100); 
}

// --- Debounced Scanning ---

// Function to escape special characters for regex (already exists)
// function escapeRegex(string) { ... }

// Function to extract search query from URL
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    let query = '';
    // Add more search engines as needed
    if (window.location.hostname.includes('google')) {
        query = urlParams.get('q');
    } else if (window.location.hostname.includes('bing')) {
        query = urlParams.get('q');
    } else if (window.location.hostname.includes('duckduckgo')) {
        query = urlParams.get('q');
    }
    // Add other search engine parameter checks here (e.g., 'p' for Yahoo)
    return query ? query.trim().toLowerCase() : null;
}

// Function to check for redirects
function checkForRedirects(rules, query) {
    if (!query || !rules || rules.length === 0) {
        return false; // No query or no rules
    }

    for (const rule of rules) {
        if (!rule.keyword || !rule.url) continue; // Skip invalid rules
        // Simple case-insensitive keyword check (checks if the query *contains* the keyword)
        if (query.includes(rule.keyword.toLowerCase())) {
            console.log(`Redirecting: Found keyword "${rule.keyword}" in query "${query}". Redirecting to ${rule.url}`);
            window.location.href = rule.url; // Perform the redirect
            return true; // Redirect initiated
        }
    }
    return false; // No matching redirect rule found
}

// Function to revert all visual changes (hiding/highlighting)
function revertAllChanges() {
    console.log('Reverting visual changes...');
    document.querySelectorAll('.search-blocker-hidden, .search-blocker-highlight').forEach(el => {
        el.classList.remove('search-blocker-hidden', 'search-blocker-highlight');
        if (el.dataset.originalDisplay) {
            el.style.display = el.dataset.originalDisplay;
            delete el.dataset.originalDisplay;
        }
    });
    // Also remove processed markers if necessary
    document.querySelectorAll('.search-blocker-processed').forEach(el => el.classList.remove('search-blocker-processed'));
}

// --- Load Initial Settings & Run --- 
function loadSettingsAndRun() {
  chrome.storage.sync.get(['blockedWords', 'filterMode', 'isEnabled', 'redirectRules'], (result) => {
    blockedWords = result.blockedWords || [];
    filterMode = result.filterMode || 'hide';
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    redirectRules = result.redirectRules || []; // Load redirect rules
    console.log('Initial settings loaded:', { blockedWords, filterMode, isEnabled, redirectRules });

    // Check for redirects FIRST if enabled
    if (isEnabled) {
        const currentQuery = getSearchQuery();
        if (checkForRedirects(redirectRules, currentQuery)) {
            return; // Stop further processing if redirected
        }
    }

    // If not redirected, proceed with blocking/highlighting or reverting
    if (isEnabled) {
        console.log('Filtering enabled, running initial scan.');
        debouncedScan(); // Initial scan for blocking/highlighting
        // Observer should already be running or will be started if needed
    } else {
        console.log('Filtering disabled, reverting changes.');
        revertAllChanges(); // Ensure changes are reverted if disabled
        // Observer should be disconnected by the storage listener
    }
  });
}

// --- Listen for Storage Changes --- 
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    let needsRescan = false;
    let needsRevert = false;
    let needsObserverRestart = false;
    const oldIsEnabled = isEnabled; // Store previous state

    console.log('Storage changed:', changes);

    if (changes.blockedWords) {
      blockedWords = changes.blockedWords.newValue || [];
      if (isEnabled) needsRescan = true;
    }
    if (changes.filterMode) {
      filterMode = changes.filterMode.newValue || 'hide';
      if (isEnabled) {
          // If mode changed, revert old highlights/hides before rescanning
          revertAllChanges(); 
          needsRescan = true;
      }
    }
    if (changes.redirectRules) {
        redirectRules = changes.redirectRules.newValue || [];
        // Redirect check happens on next page load/search, not immediately needed here
        // unless isEnabled was just turned on.
    }
    if (changes.isEnabled) {
      isEnabled = changes.isEnabled.newValue !== undefined ? changes.isEnabled.newValue : true;
      console.log(`isEnabled changed from ${oldIsEnabled} to ${isEnabled}`);
      if (isEnabled && !oldIsEnabled) {
          // --- Enabling --- 
          console.log('Extension enabled. Checking redirects and starting scan/observer.');
          // Check redirects immediately upon enabling
          const currentQuery = getSearchQuery();
          if (checkForRedirects(redirectRules, currentQuery)) {
              return; // Stop if redirected
          }
          needsRescan = true;
          needsObserverRestart = true; // Ensure observer is running
      } else if (!isEnabled && oldIsEnabled) {
          // --- Disabling --- 
          console.log('Extension disabled. Reverting changes and stopping observer.');
          needsRevert = true;
          needsObserverRestart = true; // Ensure observer is stopped
          needsRescan = false; // No scan needed if disabled
      }
    }

    // --- Apply Changes --- 
    if (needsRevert) {
        revertAllChanges();
    }
    if (needsRescan && isEnabled) {
        console.log('Settings changed, rescanning...');
        debouncedScan();
    }
    if (needsObserverRestart) {
        if (isEnabled) {
            console.log('Ensuring MutationObserver is active.');
            observer.observe(targetNode, config); // Ensure it's observing
        } else {
            console.log('Disconnecting MutationObserver.');
            observer.disconnect();
        }
    }

    console.log('Updated settings:', { blockedWords, filterMode, isEnabled, redirectRules });
  }
});

// Debounced version of the scan function
const debouncedScan = debounce(scanAndFilter, 300); // Adjust delay as needed

// Initial scan on load
// loadSettingsAndScan(); // NOTE: loadSettingsAndRun() is called at the end of the script

// --- MutationObserver Setup ---
// Select the node that will be observed for mutations
// This should ideally be a container element that holds the search results
// Body might be too broad, but works as a fallback. Needs refinement per site.
const targetNode = document.body;

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    // We are only interested in added nodes
    let addedNodes = false;
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Basic check: See if added nodes look like results (heuristic)
            // A more robust check might inspect node classes/structure
            addedNodes = true;
            break;
        }
    }
    if (addedNodes) {
        console.log('Potential new results loaded, triggering debounced scan.');
        debouncedScan();
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
// Observation is now controlled by loadSettingsAndRun and the storage listener
// observer.observe(targetNode, config); // Don't start automatically here

// Optional: Disconnect observer when the script unloads (though content scripts usually persist)
// window.addEventListener('unload', () => observer.disconnect());

console.log('MutationObserver initialized.');

// --- Initial Load --- 
loadSettingsAndRun();

// --- CSS Injection ---
const style = document.createElement('style');
style.textContent = `
  .search-blocker-hidden {
    display: none !important; /* Use important to override other styles */
  }
  .search-blocker-highlight {
    background-color: yellow; /* Example highlight style */
    border: 1px solid orange;
    padding: 2px;
  }
`;
document.head.appendChild(style);

// --- Debounce Function ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}