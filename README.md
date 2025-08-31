# RemWord - Vocabulary Learning Chrome Extension

RemWord is a powerful Chrome extension designed to help you learn vocabulary through text selection, instant translation, and interactive practice exercises. Similar to Doubao (豆包) word selection functionality, RemWord makes vocabulary learning seamless and effective.

## Features

### 🎯 Text Selection & Translation
- **Instant Translation**: Select any text on web pages to get immediate translations
- **Context Preservation**: Save words with their original context and source URL
- **Multiple Languages**: Support for Chinese, Spanish, French, German, Japanese, and Korean
- **Smart Detection**: Automatic language detection for selected text

### 📚 Vocabulary Management
- **Local Storage**: All vocabulary stored locally using IndexedDB
- **Rich Data**: Each word includes translation, context sentence, source URL, and timestamp
- **Search & Filter**: Easily find and organize your saved vocabulary
- **Export/Import**: Backup and restore your vocabulary data

### 🎮 Practice Exercises
- **Multiple Choice**: Choose correct translations from multiple options
- **Fill in the Blank**: Complete sentences with appropriate vocabulary
- **Word Matching**: Match words with their definitions
- **Context Practice**: Use words correctly in different contexts

### 📊 Progress Tracking
- **Mastery Levels**: Track learning progress from beginner to mastered
- **Practice Statistics**: Monitor accuracy and improvement over time
- **Daily Goals**: Set and track daily vocabulary learning targets
- **Streak Tracking**: Maintain learning consistency with streak counters

## Installation

### From Source (Development)
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The RemWord extension should now appear in your extensions list

### From Chrome Web Store
*Coming soon - extension will be published to Chrome Web Store*

## Usage

### Getting Started
1. **Install the extension** following the installation instructions above
2. **Select text** on any webpage to see the translation popup
3. **Save vocabulary** by clicking "Save to Vocabulary" in the popup
4. **Practice regularly** using the various exercise modes
5. **Track progress** on the dashboard

### Text Selection
1. Highlight any text on a webpage
2. A popup will appear with instant translation
3. Click "Save to Vocabulary" to add the word to your collection
4. Use "Get Definition" for detailed word information

### Vocabulary Management
1. Click the RemWord extension icon in the toolbar
2. Use "Review Words" to see your saved vocabulary
3. Search and filter words by language or mastery level
4. Export your data for backup purposes

### Practice Exercises
1. Open the extension options page
2. Navigate to the "Practice" section
3. Choose from four different exercise types:
   - **Multiple Choice**: Select correct translations
   - **Fill in the Blank**: Complete sentences
   - **Word Matching**: Match words with definitions
   - **Context Practice**: Use words in sentences

## Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension manifest version
- **Content Scripts**: Handles text selection and popup display
- **Background Service Worker**: Manages extension lifecycle and messaging
- **IndexedDB**: Local database for vocabulary storage
- **Translation APIs**: Multiple translation services for reliability

### File Structure
```
remword/
├── manifest.json              # Extension manifest
├── scripts/
│   ├── background.js         # Service worker
│   ├── content.js           # Content script for text selection
│   ├── database.js          # IndexedDB wrapper
│   └── translation.js       # Translation service
├── popup/
│   ├── popup.html           # Extension popup interface
│   ├── popup.css            # Popup styles
│   └── popup.js             # Popup functionality
├── options/
│   ├── options.html         # Options page
│   ├── options.css          # Options page styles
│   ├── options.js           # Options page functionality
│   └── practice.js          # Practice exercise system
├── styles/
│   └── content.css          # Content script styles
├── icons/
│   └── [icon files]         # Extension icons
└── README.md                # This file
```

### Permissions
- `storage`: For saving vocabulary and settings
- `activeTab`: For accessing current tab content
- `scripting`: For injecting content scripts
- `tabs`: For tab management
- `host_permissions`: For accessing web pages

## Privacy & Security

- **Local Storage**: All data is stored locally on your device
- **No Data Collection**: RemWord does not collect or transmit personal data
- **Secure APIs**: Uses reputable translation services
- **Open Source**: Code is available for review and contribution

## Development

### Prerequisites
- Chrome browser (version 88+)
- Basic knowledge of JavaScript, HTML, and CSS

### Setup Development Environment
1. Clone the repository
2. Load the extension in Chrome developer mode
3. Make changes to the code
4. Reload the extension to test changes

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues
- **Translation not working**: Check internet connection and try again
- **Words not saving**: Ensure extension has proper permissions
- **Practice not loading**: Refresh the options page
- **Popup not appearing**: Check if content scripts are properly loaded

### Support
For issues and feature requests, please create an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Doubao (豆包) text selection functionality
- Uses free translation APIs for language support
- Built with modern Chrome Extension APIs

## Roadmap

### Upcoming Features
- [ ] Spaced repetition algorithm for optimal learning
- [ ] Offline mode support
- [ ] Additional language pairs
- [ ] Advanced analytics and insights
- [ ] Collaborative vocabulary sharing
- [ ] Mobile app companion

### Version History
- **v1.0.0**: Initial release with core functionality
  - Text selection and translation
  - Vocabulary management
  - Practice exercises
  - Progress tracking

---

**RemWord** - Making vocabulary learning effortless, one word at a time! 📚✨
