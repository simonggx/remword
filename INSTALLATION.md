# RemWord Chrome Extension - Installation Guide

## Quick Start

### Step 1: Prepare Icons
Before installing the extension, you need to create the required icon files:

1. Open `icons/create_icons.html` in your web browser
2. Click "Generate Icons" 
3. Download all four icon files (icon16.png, icon32.png, icon48.png, icon128.png)
4. Save them in the `icons/` directory

### Step 2: Install Extension
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `remword` folder containing the extension files
6. The RemWord extension should now appear in your extensions list

### Step 3: Verify Installation
- Look for the RemWord icon in your Chrome toolbar
- Click the icon to open the popup interface
- Right-click the icon and select "Options" to open the full interface

## Detailed Setup Instructions

### Prerequisites
- Google Chrome browser (version 88 or later)
- Basic understanding of Chrome extensions

### File Structure Verification
Ensure your extension directory contains:
```
remword/
├── manifest.json
├── scripts/
│   ├── background.js
│   ├── content.js
│   ├── database.js
│   └── translation.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html
│   ├── options.css
│   ├── options.js
│   └── practice.js
├── styles/
│   └── content.css
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Troubleshooting Installation

#### Extension Won't Load
- **Check file structure**: Ensure all files are in correct locations
- **Verify manifest.json**: Check for syntax errors
- **Check console**: Look for error messages in Chrome DevTools

#### Icons Not Displaying
- **Create icons**: Use the provided `icons/create_icons.html` tool
- **Check file names**: Ensure icons are named exactly as specified
- **Verify file format**: Icons must be PNG format

#### Permission Errors
- **Enable Developer Mode**: Must be enabled to load unpacked extensions
- **Check file permissions**: Ensure Chrome can read all extension files

### First Use Setup

#### 1. Configure Settings
1. Right-click the RemWord icon → Options
2. Go to Settings section
3. Set your preferred target language
4. Configure daily vocabulary goal
5. Enable/disable features as desired
6. Click "Save Settings"

#### 2. Test Basic Functionality
1. Navigate to any webpage with text
2. Select a word or phrase
3. Verify translation popup appears
4. Try saving a word to vocabulary
5. Check that it appears in the popup's recent words

#### 3. Explore Practice Features
1. Save at least 5 vocabulary items
2. Go to Options → Practice
3. Try different exercise types
4. Verify progress tracking works

## Usage Tips

### Getting the Most from RemWord

1. **Regular Practice**: Set aside 10-15 minutes daily for vocabulary practice
2. **Context Matters**: Always save words with their context for better learning
3. **Diverse Sources**: Collect vocabulary from various websites and topics
4. **Track Progress**: Use the dashboard to monitor your learning journey
5. **Export Backup**: Regularly export your vocabulary data as backup

### Best Practices

- **Quality over Quantity**: Focus on learning words thoroughly rather than collecting many
- **Review Regularly**: Use the practice exercises to reinforce learning
- **Set Realistic Goals**: Start with 5-10 new words per day
- **Use Context**: Pay attention to how words are used in sentences

## Advanced Configuration

### Custom Translation Services
The extension uses free translation APIs by default. For better accuracy:
- Consider upgrading to premium translation services
- Modify `scripts/translation.js` to use your preferred API
- Add API keys in the settings if required

### Data Management
- **Export**: Regularly backup your vocabulary data
- **Import**: Share vocabulary lists between devices
- **Clear**: Use with caution - this permanently deletes all data

### Performance Optimization
- **Large Vocabularies**: Extension tested with 1000+ words
- **Memory Usage**: Monitor in Chrome Task Manager if needed
- **Cache Management**: Translation cache clears automatically

## Security and Privacy

### Data Storage
- All vocabulary data stored locally in browser
- No data transmitted to external servers (except for translations)
- IndexedDB used for reliable local storage

### Permissions Explained
- **storage**: Save vocabulary and settings locally
- **activeTab**: Access current webpage for text selection
- **scripting**: Inject content scripts for functionality
- **tabs**: Manage extension behavior across tabs

### Privacy Protection
- No personal data collection
- No tracking or analytics
- Translation requests only contain selected text
- All processing happens locally

## Uninstallation

### Remove Extension
1. Go to `chrome://extensions/`
2. Find RemWord extension
3. Click "Remove"
4. Confirm removal

### Data Cleanup
- Extension data automatically removed with uninstallation
- No manual cleanup required
- Export data before uninstalling if you want to keep it

## Support and Troubleshooting

### Common Issues

**Translation not working**
- Check internet connection
- Try different text selection
- Verify translation service is accessible

**Vocabulary not saving**
- Check browser storage permissions
- Verify extension has proper permissions
- Try reloading the extension

**Practice exercises not loading**
- Ensure you have saved vocabulary items
- Check browser console for errors
- Try refreshing the options page

**Performance issues**
- Check vocabulary database size
- Clear browser cache
- Restart Chrome if needed

### Getting Help
- Check the README.md for detailed documentation
- Review TESTING.md for comprehensive testing procedures
- Create issues on the project repository for bugs
- Check Chrome extension developer documentation

## Development and Customization

### For Developers
- Extension uses Manifest V3
- Built with vanilla JavaScript
- IndexedDB for data persistence
- Content scripts for webpage interaction

### Customization Options
- Modify translation services in `scripts/translation.js`
- Customize UI in CSS files
- Add new practice exercise types in `options/practice.js`
- Extend database schema in `scripts/database.js`

---

**Enjoy learning vocabulary with RemWord!** 📚✨

For additional help, refer to the main README.md file or the comprehensive testing guide in TESTING.md.
