// Service worker for Search Result Blocker

// Listener for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings if they don't exist
  chrome.storage.sync.get(['blockedWords', 'filterMode', 'isEnabled'], (result) => {
    if (result.blockedWords === undefined) {
      chrome.storage.sync.set({ blockedWords: [] });
    }
    if (result.filterMode === undefined) {
      chrome.storage.sync.set({ filterMode: 'hide' }); // 'hide' or 'highlight'
    }
    if (result.isEnabled === undefined) {
      chrome.storage.sync.set({ isEnabled: true });
    }
  });
  console.log('Search Result Blocker installed/updated.');
});

// Listener for messages from popup or content script (if needed later)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in service worker:', request);
  // Handle messages here if necessary
  // Example: if (request.action === 'getBlockedWords') { ... }
  sendResponse({ status: 'Message received' });
  return true; // Indicates that the response is sent asynchronously
});

// Listener for storage changes to potentially update content scripts
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Storage changed:', changes);
    // If settings change, notify active content scripts to re-apply filters
    if (changes.blockedWords || changes.filterMode || changes.isEnabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsChanged' }, (response) => {
            if (chrome.runtime.lastError) {
              // Handle error if the content script isn't ready or doesn't exist
              console.log('Could not send message to content script:', chrome.runtime.lastError.message);
            } else {
              console.log('Settings change notification sent to content script.');
            }
          });
        }
      });
    }
  }
});