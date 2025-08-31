# RemWord Extension Testing Guide

This document provides comprehensive testing instructions for the RemWord Chrome extension to ensure all features work correctly across different scenarios.

## Pre-Testing Setup

### 1. Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the RemWord extension directory
4. Verify the extension appears in the extensions list with no errors

### 2. Initial Verification
- [ ] Extension icon appears in Chrome toolbar
- [ ] No console errors in extension background page
- [ ] Extension popup opens when clicking the icon
- [ ] Options page accessible via right-click → Options

## Core Functionality Testing

### Text Selection and Translation

#### Test 1: Basic Text Selection
1. Navigate to any English webpage (e.g., Wikipedia, news site)
2. Select a single English word
3. **Expected**: Translation popup appears within 2 seconds
4. **Verify**: 
   - Popup shows selected word
   - Translation is displayed
   - "Save to Vocabulary" button is enabled
   - "Get Definition" button is present

#### Test 2: Multi-word Selection
1. Select a phrase (2-5 words)
2. **Expected**: Popup appears with phrase translation
3. **Verify**: Context is preserved correctly

#### Test 3: Different Languages
1. Test on pages with different languages:
   - Spanish text
   - French text
   - German text
2. **Expected**: Appropriate translations appear
3. **Verify**: Language detection works correctly

#### Test 4: Edge Cases
- [ ] Very long text selection (>100 characters)
- [ ] Text with special characters/punctuation
- [ ] Text in different fonts/sizes
- [ ] Text in tables or lists
- [ ] Text in form inputs (should not trigger)

### Vocabulary Management

#### Test 5: Saving Vocabulary
1. Select text and click "Save to Vocabulary"
2. **Expected**: 
   - Success message appears
   - Button changes to "Saved!"
   - Word is added to database

#### Test 6: Vocabulary Storage
1. Save 5-10 different words from various websites
2. Open extension popup
3. **Expected**: Recent words appear in popup
4. Open options page → Vocabulary section
5. **Expected**: All saved words appear in table with:
   - Original word
   - Translation
   - Context sentence
   - Source URL
   - Timestamp

#### Test 7: Vocabulary Search and Filter
1. In options page, use search box to find specific words
2. **Expected**: Results filter in real-time
3. Test language filter dropdown
4. **Expected**: Words filter by language
5. Test "Clear Filters" button
6. **Expected**: All filters reset

#### Test 8: Vocabulary Export/Import
1. Save several vocabulary items
2. Click "Export Data" in settings
3. **Expected**: JSON file downloads with vocabulary data
4. Clear all data
5. Import the exported file
6. **Expected**: All vocabulary restored correctly

### Practice Exercises

#### Test 9: Multiple Choice Practice
1. Save at least 5 vocabulary items
2. Go to Practice section → Multiple Choice
3. **Expected**: 
   - Questions generate correctly
   - 4 answer options appear
   - Correct/incorrect feedback works
   - Progress tracking updates
   - Final results screen appears

#### Test 10: Fill in the Blank
1. Start Fill in the Blank practice
2. **Expected**:
   - Context sentences with blanks appear
   - Text input accepts answers
   - Case-insensitive checking works
   - Feedback is appropriate

#### Test 11: Word Matching
1. Start Word Matching practice
2. **Expected**:
   - Word to match displays clearly
   - Input field accepts translations
   - Matching logic works correctly

#### Test 12: Context Practice
1. Start Context Practice
2. **Expected**:
   - Prompts for sentence creation appear
   - Textarea accepts input
   - Basic validation works (word inclusion)

### Progress Tracking

#### Test 13: Dashboard Statistics
1. After completing practice exercises
2. Check Dashboard section
3. **Expected**:
   - Total words count is accurate
   - Streak calculation works
   - Mastery levels update
   - Accuracy percentage calculates correctly

#### Test 14: Weekly Progress Chart
1. Add vocabulary over several days (or modify timestamps for testing)
2. Check Dashboard weekly chart
3. **Expected**:
   - Bars show relative heights
   - Days are labeled correctly
   - Hover tooltips work

### Settings and Configuration

#### Test 15: Settings Persistence
1. Change target language in settings
2. Change daily goal
3. Toggle checkboxes
4. Save settings
5. Reload extension
6. **Expected**: All settings persist correctly

#### Test 16: Settings Application
1. Change target language to Spanish
2. Select English text on a webpage
3. **Expected**: Translation appears in Spanish
4. Change auto-translate setting
5. **Expected**: Behavior changes accordingly

## Cross-Browser and Website Testing

### Test 17: Different Websites
Test text selection on various types of websites:
- [ ] News websites (CNN, BBC, etc.)
- [ ] Wikipedia articles
- [ ] Blog posts
- [ ] E-commerce sites
- [ ] Social media (Twitter, Reddit)
- [ ] Documentation sites
- [ ] Educational platforms

### Test 18: Different Content Types
- [ ] Plain text paragraphs
- [ ] Text in headings
- [ ] Text in lists
- [ ] Text in tables
- [ ] Text with links
- [ ] Text with formatting (bold, italic)

### Test 19: Page Interactions
- [ ] Text selection works after page scroll
- [ ] Works with dynamically loaded content
- [ ] Popup positioning adjusts for screen edges
- [ ] Multiple popups don't interfere
- [ ] Works with page zoom levels

## Error Handling and Edge Cases

### Test 20: Network Issues
1. Disconnect internet
2. Try to translate text
3. **Expected**: Graceful error message
4. Reconnect internet
5. **Expected**: Translation works again

### Test 21: Large Vocabulary Database
1. Import/create 100+ vocabulary items
2. Test all functionality
3. **Expected**: Performance remains acceptable
4. **Verify**: No memory leaks or slowdowns

### Test 22: Data Corruption Recovery
1. Manually corrupt database (if possible)
2. **Expected**: Extension handles gracefully
3. **Verify**: Error messages are user-friendly

## Performance Testing

### Test 23: Memory Usage
1. Monitor extension memory usage in Chrome Task Manager
2. Use extension heavily for 30 minutes
3. **Expected**: Memory usage remains stable
4. **Verify**: No significant memory leaks

### Test 24: Response Times
- [ ] Text selection popup appears within 2 seconds
- [ ] Translation loads within 5 seconds
- [ ] Practice exercises load within 3 seconds
- [ ] Options page loads within 2 seconds

## Accessibility Testing

### Test 25: Keyboard Navigation
- [ ] Tab navigation works in popup
- [ ] Tab navigation works in options page
- [ ] Enter key submits forms appropriately
- [ ] Escape key closes popups

### Test 26: Screen Reader Compatibility
- [ ] Alt text present on images
- [ ] Proper heading structure
- [ ] Form labels associated correctly
- [ ] ARIA attributes where appropriate

## Security Testing

### Test 27: Content Security
- [ ] Extension doesn't interfere with page functionality
- [ ] No unauthorized data access
- [ ] Popup doesn't break page layout
- [ ] No XSS vulnerabilities in user input

### Test 28: Data Privacy
- [ ] All data stored locally
- [ ] No unauthorized network requests
- [ ] User data not transmitted externally
- [ ] Clear data functionality works completely

## Final Verification Checklist

Before considering testing complete, verify:

- [ ] All core features work as expected
- [ ] No console errors in any component
- [ ] Data persistence works correctly
- [ ] UI is responsive and intuitive
- [ ] Performance is acceptable
- [ ] Error handling is graceful
- [ ] Settings work and persist
- [ ] Export/import functionality works
- [ ] Practice exercises are engaging and functional
- [ ] Progress tracking is accurate

## Bug Reporting Template

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser version**
5. **Extension version**
6. **Console errors (if any)**
7. **Screenshots/videos (if applicable)**

## Test Environment Recommendations

- **Chrome Version**: Latest stable
- **Operating System**: Windows 10/11, macOS, Linux
- **Screen Resolutions**: 1920x1080, 1366x768, mobile sizes
- **Network Conditions**: Fast, slow, offline
- **Websites**: Mix of popular and niche sites

---

**Note**: This testing guide should be executed thoroughly before any release. Consider automated testing for regression prevention in future versions.
