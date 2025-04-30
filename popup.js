document.addEventListener('DOMContentLoaded', () => {
  const newWordInput = document.getElementById('newWord');
  const addWordBtn = document.getElementById('addWordBtn');
  const blockedWordsList = document.getElementById('blockedWordsList');
  const filterModeSelect = document.getElementById('filterMode');
  const enableSwitch = document.getElementById('enableSwitch');

  let currentBlockedWords = [];

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

  // Load initial state from storage
  chrome.storage.sync.get(['blockedWords', 'filterMode', 'isEnabled'], (result) => {
    currentBlockedWords = result.blockedWords || [];
    filterModeSelect.value = result.filterMode || 'hide';
    enableSwitch.checked = result.isEnabled !== undefined ? result.isEnabled : true;
    renderBlockedWords();
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

  // Filter mode change
  filterModeSelect.addEventListener('change', () => {
    const newMode = filterModeSelect.value;
    chrome.storage.sync.set({ filterMode: newMode }, () => {
      console.log(`Filter mode changed to: ${newMode}`);
    });
  });

  // Enable/disable switch change
  enableSwitch.addEventListener('change', () => {
    const isEnabled = enableSwitch.checked;
    chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
      console.log(`Filtering ${isEnabled ? 'enabled' : 'disabled'}`);
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
      }
  });

});