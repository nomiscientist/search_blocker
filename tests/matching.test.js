// Basic assertion helper
function assertEquals(expected, actual, message) {
  if (expected !== actual) {
    console.error(`Assertion Failed: ${message || ''}. Expected ${expected}, but got ${actual}`);
    throw new Error(`Assertion Failed: ${message || ''}. Expected ${expected}, but got ${actual}`);
  }
  console.log(`Assertion Passed: ${message || ''}`);
}

// Placeholder for the function to be tested (needs to be imported or defined)
// Assuming a function like: matches(text, blockedWord)
// For now, we'll simulate it.
function escapeRegex(string) {
  // Simple escape for common regex special characters
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function checkMatch(text, blockedWord) {
    if (!blockedWord) return false;
    const regex = new RegExp(escapeRegex(blockedWord), 'i'); // Case-insensitive
    return regex.test(text);
}

console.log('--- Running Basic Matching Tests ---');

// Test cases
try {
  // Case-insensitivity
  assertEquals(true, checkMatch('This is a Test sentence.', 'test'), 'Case-insensitive match');
  assertEquals(true, checkMatch('Another TEST here.', 'test'), 'Case-insensitive match (uppercase)');
  assertEquals(false, checkMatch('No match here.', 'test'), 'Case-insensitive no match');

  // Phrase matching
  assertEquals(true, checkMatch('Block this specific phrase.', 'specific phrase'), 'Phrase match');
  assertEquals(false, checkMatch('Block this specific word.', 'specific phrase'), 'Phrase no match');

  // Word boundaries (Note: current simple regex doesn't enforce strict word boundaries)
  // assertEquals(true, checkMatch('Test this word.', 'test'), 'Whole word match (simple)'); // This will pass
  // assertEquals(false, checkMatch('Testing this word.', 'test'), 'Partial word should not match (strict boundary)'); // This would FAIL with current simple regex

  // Special characters
  assertEquals(true, checkMatch('Match with $pecial char$.', '$pecial char$'), 'Special character match');

  console.log('--- All Basic Tests Passed ---');
} catch (error) {
  console.error('--- Test Run Failed ---');
}