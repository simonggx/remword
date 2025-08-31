// Background service worker for RemWord extension
class RemWordBackground {
  constructor() {
    this.init();
  }

  init() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Handle context menu creation
    this.createContextMenus();
    
    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
  }

  handleInstall(details) {
    if (details.reason === 'install') {
      // Set default settings
      chrome.storage.sync.set({
        targetLanguage: 'zh',
        autoTranslate: true,
        showDefinitions: true,
        practiceReminders: true,
        dailyGoal: 10
      });
      
      // Open options page on first install
      chrome.tabs.create({
        url: chrome.runtime.getURL('options/options.html')
      });
    }
  }

  createContextMenus() {
    chrome.contextMenus.create({
      id: 'remword-translate',
      title: 'Translate with RemWord',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'remword-save',
      title: 'Save to Vocabulary',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'remword-separator',
      type: 'separator',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'remword-practice',
      title: 'Practice Vocabulary',
      contexts: ['page']
    });
  }

  async handleContextMenuClick(info, tab) {
    switch (info.menuItemId) {
      case 'remword-translate':
        await this.translateSelection(info, tab);
        break;
      case 'remword-save':
        await this.saveSelection(info, tab);
        break;
      case 'remword-practice':
        await this.openPractice();
        break;
    }
  }

  async translateSelection(info, tab) {
    if (!info.selectionText) return;
    
    try {
      // Inject content script if not already present
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['scripts/translation.js', 'scripts/database.js', 'scripts/content.js']
      });
      
      // Send message to content script to show translation
      chrome.tabs.sendMessage(tab.id, {
        action: 'showTranslation',
        text: info.selectionText
      });
    } catch (error) {
      console.error('Failed to translate selection:', error);
    }
  }

  async saveSelection(info, tab) {
    if (!info.selectionText) return;
    
    try {
      // Get translation first
      const translation = await this.getTranslation(info.selectionText);
      
      // Send message to content script to save vocabulary
      chrome.tabs.sendMessage(tab.id, {
        action: 'saveVocabulary',
        word: info.selectionText,
        translation: translation,
        sourceUrl: tab.url
      });
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'RemWord',
        message: `"${info.selectionText}" saved to vocabulary!`
      });
    } catch (error) {
      console.error('Failed to save selection:', error);
    }
  }

  async openPractice() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html#practice')
    });
  }

  async getTranslation(text) {
    // Simple translation using the same service as content script
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
    
    return `Translation for: ${text}`;
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'getSettings':
        const settings = await chrome.storage.sync.get([
          'targetLanguage',
          'autoTranslate',
          'showDefinitions',
          'practiceReminders',
          'dailyGoal'
        ]);
        sendResponse(settings);
        break;
        
      case 'updateSettings':
        await chrome.storage.sync.set(request.settings);
        sendResponse({ success: true });
        break;
        
      case 'getVocabularyStats':
        // This would typically query the database
        // For now, return mock stats
        sendResponse({
          totalWords: 0,
          wordsThisWeek: 0,
          practiceStreak: 0,
          masteryLevel: 0
        });
        break;
        
      case 'showNotification':
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: request.title || 'RemWord',
          message: request.message
        });
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
    
    return true; // Keep message channel open for async response
  }

  // Set up daily practice reminders
  setupPracticeReminders() {
    chrome.alarms.create('dailyPractice', {
      when: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      periodInMinutes: 24 * 60 // Repeat every 24 hours
    });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'dailyPractice') {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'RemWord Practice Reminder',
          message: 'Time to practice your vocabulary! Click to start.'
        });
      }
    });
  }
}

// Initialize background script
new RemWordBackground();
