document.addEventListener('DOMContentLoaded', () => {
  const newWordInput = document.getElementById('newWord');
  const addWordBtn = document.getElementById('addWordBtn');
  const blockedWordsList = document.getElementById('blockedWordsList');
  const filterModeSelect = document.getElementById('filterMode');
  const enableSwitch = document.getElementById('enableSwitch');

  // Redirect rules elements
  const redirectKeywordInput = document.getElementById('redirectKeyword');
  const redirectUrlInput = document.getElementById('redirectUrl');
  const addRedirectBtn = document.getElementById('addRedirectBtn');
  const redirectRulesList = document.getElementById('redirectRulesList');

  let currentBlockedWords = [];
  let currentRedirectRules = []; // To store redirect rules {keyword: '...', url: '...'}

  // Function to render the blocked words list
  function renderBlockedWords() {
    blockedWordsList.innerHTML = ''; // Clear current list
    if (currentBlockedWords.length === 0) {
      blockedWordsList.innerHTML = '<li>No words blocked yet.</li>';
      return;
    }
    currentBlockedWords.forEach((word, index) => {
      const li = document.createElement('li');
      const wordSpan = document.createElement('span');
      wordSpan.textContent = word;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.className = 'remove-word';
      removeBtn.dataset.index = index;
      removeBtn.title = 'Remove word';

      removeBtn.addEventListener('click', () => {
        removeWord(index);
      });

      li.appendChild(wordSpan);
      li.appendChild(removeBtn);
      blockedWordsList.appendChild(li);
    });
  }

  // Function to render the redirect rules list
  function renderRedirectRules() {
    redirectRulesList.innerHTML = ''; // Clear current list
    if (currentRedirectRules.length === 0) {
      redirectRulesList.innerHTML = '<li>No redirect rules defined.</li>';
      return;
    }
    currentRedirectRules.forEach((rule, index) => {
      const li = document.createElement('li');
      const ruleSpan = document.createElement('span');
      ruleSpan.textContent = `"${rule.keyword}" → ${rule.url}`;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.className = 'remove-rule'; // Use a different class
      removeBtn.dataset.index = index;
      removeBtn.title = 'Remove rule';

      removeBtn.addEventListener('click', () => {
        removeRedirectRule(index);
      });

      li.appendChild(ruleSpan);
      li.appendChild(removeBtn);
      redirectRulesList.appendChild(li);
    });
  }

  // Function to add a redirect rule
  function addRedirectRule() {
    const keyword = redirectKeywordInput.value.trim();
    const url = redirectUrlInput.value.trim();

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    if (keyword && url) {
      // Check if keyword already exists
      if (currentRedirectRules.some(rule => rule.keyword.toLowerCase() === keyword.toLowerCase())) {
          alert(`A redirect rule for "${keyword}" already exists.`);
          return;
      }
      currentRedirectRules.push({ keyword, url });
      chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
        console.log(`Redirect rule added: "${keyword}" -> ${url}`);
        renderRedirectRules();
        redirectKeywordInput.value = ''; // Clear inputs
        redirectUrlInput.value = '';
      });
    } else {
        alert('Please enter both a keyword/phrase and a valid URL.');
    }
  }

  // Function to remove a redirect rule
  function removeRedirectRule(index) {
    const ruleToRemove = currentRedirectRules[index];
    currentRedirectRules.splice(index, 1);
    chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
      console.log(`Redirect rule removed: "${ruleToRemove.keyword}"`);
      renderRedirectRules();
    });
  }

  // Function to add a word
  function addWord() {
    const word = newWordInput.value.trim();
    if (word && !currentBlockedWords.includes(word)) {
      currentBlockedWords.push(word);
      chrome.storage.sync.set({ blockedWords: currentBlockedWords }, () => {
        console.log(`Word "${word}" added.`);
        renderBlockedWords();
        newWordInput.value = ''; // Clear input
      });
    } else if (currentBlockedWords.includes(word)) {
        alert(`"${word}" is already in the list.`);
    } else {
        alert('Please enter a word or phrase.');
    }
  }

  // Function to remove a word
  function removeWord(index) {
    const wordToRemove = currentBlockedWords[index];
    currentBlockedWords.splice(index, 1);
    chrome.storage.sync.set({ blockedWords: currentBlockedWords }, () => {
      console.log(`Word "${wordToRemove}" removed.`);
      renderBlockedWords();
    });
  }

  // Function to render the redirect rules list
  function renderRedirectRules() {
    redirectRulesList.innerHTML = ''; // Clear current list
    if (currentRedirectRules.length === 0) {
      redirectRulesList.innerHTML = '<li>No redirect rules defined.</li>';
      return;
    }
    currentRedirectRules.forEach((rule, index) => {
      const li = document.createElement('li');
      const ruleSpan = document.createElement('span');
      ruleSpan.textContent = `"${rule.keyword}" → ${rule.url}`;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.className = 'remove-rule'; // Use a different class
      removeBtn.dataset.index = index;
      removeBtn.title = 'Remove rule';

      removeBtn.addEventListener('click', () => {
        removeRedirectRule(index);
      });

      li.appendChild(ruleSpan);
      li.appendChild(removeBtn);
      redirectRulesList.appendChild(li);
    });
  }

  // Function to add a redirect rule
  function addRedirectRule() {
    const keyword = redirectKeywordInput.value.trim();
    const url = redirectUrlInput.value.trim();

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    if (keyword && url) {
      // Check if keyword already exists
      if (currentRedirectRules.some(rule => rule.keyword.toLowerCase() === keyword.toLowerCase())) {
          alert(`A redirect rule for "${keyword}" already exists.`);
          return;
      }
      currentRedirectRules.push({ keyword, url });
      chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
        console.log(`Redirect rule added: "${keyword}" -> ${url}`);
        renderRedirectRules();
        redirectKeywordInput.value = ''; // Clear inputs
        redirectUrlInput.value = '';
      });
    } else {
        alert('Please enter both a keyword/phrase and a valid URL.');
    }
  }

  // Function to remove a redirect rule
  function removeRedirectRule(index) {
    const ruleToRemove = currentRedirectRules[index];
    currentRedirectRules.splice(index, 1);
    chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
      console.log(`Redirect rule removed: "${ruleToRemove.keyword}"`);
      renderRedirectRules();
    });
  }

  // Load initial state from storage
  chrome.storage.sync.get(['blockedWords', 'filterMode', 'isEnabled', 'redirectRules'], (result) => {
    currentBlockedWords = result.blockedWords || [];
    currentRedirectRules = result.redirectRules || [];
    filterModeSelect.value = result.filterMode || 'hide';
    enableSwitch.checked = result.isEnabled !== undefined ? result.isEnabled : true;
    renderBlockedWords();
    renderRedirectRules(); // Render redirect rules on load
  });

  // --- Event Listeners ---

  // Add word button
  addWordBtn.addEventListener('click', addWord);

  // Allow adding word with Enter key
  newWordInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addWord();
    }
  });

  // Add redirect rule button
  addRedirectBtn.addEventListener('click', addRedirectRule);

  // Allow adding redirect rule with Enter key in URL input
  redirectUrlInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          addRedirectRule();
      }
  });
   // Allow adding redirect rule with Enter key in Keyword input
  redirectKeywordInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
          // Optionally move focus to URL input or directly add
          redirectUrlInput.focus(); // Move focus
          // Or: addRedirectRule();
      }
  });

  // Filter mode change
  filterModeSelect.addEventListener('change', () => {
    const newMode = filterModeSelect.value;
    chrome.storage.sync.set({ filterMode: newMode }, () => {
      console.log(`Filter mode changed to: ${newMode}`);
    });
  }

  // Function to render the redirect rules list
  function renderRedirectRules() {
    redirectRulesList.innerHTML = ''; // Clear current list
    if (currentRedirectRules.length === 0) {
      redirectRulesList.innerHTML = '<li>No redirect rules defined.</li>';
      return;
    }
    currentRedirectRules.forEach((rule, index) => {
      const li = document.createElement('li');
      const ruleSpan = document.createElement('span');
      ruleSpan.textContent = `"${rule.keyword}" → ${rule.url}`;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.className = 'remove-rule'; // Use a different class
      removeBtn.dataset.index = index;
      removeBtn.title = 'Remove rule';

      removeBtn.addEventListener('click', () => {
        removeRedirectRule(index);
      });

      li.appendChild(ruleSpan);
      li.appendChild(removeBtn);
      redirectRulesList.appendChild(li);
    });
  }

  // Function to add a redirect rule
  function addRedirectRule() {
    const keyword = redirectKeywordInput.value.trim();
    const url = redirectUrlInput.value.trim();

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    if (keyword && url) {
      // Check if keyword already exists
      if (currentRedirectRules.some(rule => rule.keyword.toLowerCase() === keyword.toLowerCase())) {
          alert(`A redirect rule for "${keyword}" already exists.`);
          return;
      }
      currentRedirectRules.push({ keyword, url });
      chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
        console.log(`Redirect rule added: "${keyword}" -> ${url}`);
        renderRedirectRules();
        redirectKeywordInput.value = ''; // Clear inputs
        redirectUrlInput.value = '';
      });
    } else {
        alert('Please enter both a keyword/phrase and a valid URL.');
    }
  }

  // Function to remove a redirect rule
  function removeRedirectRule(index) {
    const ruleToRemove = currentRedirectRules[index];
    currentRedirectRules.splice(index, 1);
    chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
      console.log(`Redirect rule removed: "${ruleToRemove.keyword}"`);
      renderRedirectRules();
    });
  });

  // Enable/disable switch change
  enableSwitch.addEventListener('change', () => {
    const isEnabled = enableSwitch.checked;
    chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
      console.log(`Filtering ${isEnabled ? 'enabled' : 'disabled'}`);
    });
  }

  // Function to render the redirect rules list
  function renderRedirectRules() {
    redirectRulesList.innerHTML = ''; // Clear current list
    if (currentRedirectRules.length === 0) {
      redirectRulesList.innerHTML = '<li>No redirect rules defined.</li>';
      return;
    }
    currentRedirectRules.forEach((rule, index) => {
      const li = document.createElement('li');
      const ruleSpan = document.createElement('span');
      ruleSpan.textContent = `"${rule.keyword}" → ${rule.url}`;
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.className = 'remove-rule'; // Use a different class
      removeBtn.dataset.index = index;
      removeBtn.title = 'Remove rule';

      removeBtn.addEventListener('click', () => {
        removeRedirectRule(index);
      });

      li.appendChild(ruleSpan);
      li.appendChild(removeBtn);
      redirectRulesList.appendChild(li);
    });
  }

  // Function to add a redirect rule
  function addRedirectRule() {
    const keyword = redirectKeywordInput.value.trim();
    const url = redirectUrlInput.value.trim();

    // Basic URL validation
    try {
        new URL(url);
    } catch (_) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }

    if (keyword && url) {
      // Check if keyword already exists
      if (currentRedirectRules.some(rule => rule.keyword.toLowerCase() === keyword.toLowerCase())) {
          alert(`A redirect rule for "${keyword}" already exists.`);
          return;
      }
      currentRedirectRules.push({ keyword, url });
      chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
        console.log(`Redirect rule added: "${keyword}" -> ${url}`);
        renderRedirectRules();
        redirectKeywordInput.value = ''; // Clear inputs
        redirectUrlInput.value = '';
      });
    } else {
        alert('Please enter both a keyword/phrase and a valid URL.');
    }
  }

  // Function to remove a redirect rule
  function removeRedirectRule(index) {
    const ruleToRemove = currentRedirectRules[index];
    currentRedirectRules.splice(index, 1);
    chrome.storage.sync.set({ redirectRules: currentRedirectRules }, () => {
      console.log(`Redirect rule removed: "${ruleToRemove.keyword}"`);
      renderRedirectRules();
    });
  });

  // Listen for storage changes from other parts of the extension (e.g., options page)
  chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
          if (changes.blockedWords) {
              currentBlockedWords = changes.blockedWords.newValue || [];
              renderBlockedWords();
          }
          if (changes.filterMode) {
              filterModeSelect.value = changes.filterMode.newValue || 'hide';
          }
          if (changes.isEnabled) {
              enableSwitch.checked = changes.isEnabled.newValue !== undefined ? changes.isEnabled.newValue : true;
          }
          if (changes.redirectRules) {
              currentRedirectRules = changes.redirectRules.newValue || [];
              renderRedirectRules();
          }
      }
  });

});