# Search Result Blocker Chrome Extension

This Chrome extension allows you to block or highlight search results on Google, Bing, and DuckDuckGo based on a custom list of words or phrases.

## Features

*   **Blocklist Management:** Add or remove words/phrases via the extension popup.
*   **Filtering Modes:** Choose to either completely hide matching search results or highlight the blocked terms within them.
*   **Enable/Disable:** Easily toggle the filtering on or off.
*   **Syncing:** Your blocklist and settings are synced across your browsers using Chrome Storage Sync.
*   **Dynamic Content Handling:** Works with dynamically loaded search results (AJAX).

## Installation

1.  **Clone or Download:** Get the extension code from the repository.
2.  **Open Chrome Extensions:** Navigate to `chrome://extensions` in your Chrome browser.
3.  **Enable Developer Mode:** Turn on the "Developer mode" toggle, usually found in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button.
5.  **Select Folder:** Browse to the directory where you cloned or downloaded the extension code and select the main folder (the one containing `manifest.json`).
6.  The extension should now be installed and visible in your extensions list and toolbar.

## Usage

1.  **Click the Icon:** Click the Search Result Blocker icon (SB) in your Chrome toolbar to open the popup.
2.  **Add Words:** Type a word or phrase into the input field and click "Add" or press Enter.
3.  **Remove Words:** Click the '✖' icon next to a word in the list to remove it.
4.  **Choose Mode:** Select either "Hide Results" or "Highlight Terms" from the dropdown.
5.  **Toggle Filtering:** Use the switch to enable or disable the filtering.

Your settings are saved automatically. The extension will filter search results on supported pages when enabled.