// RemWord Popup JavaScript
class RemWordPopup {
  constructor() {
    this.vocabularyDB = new VocabularyDB();
    this.settings = {};
    this.init();
  }

  async init() {
    await this.vocabularyDB.init();
    await this.loadSettings();
    this.setupEventListeners();
    await this.loadData();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      this.settings = response || {
        targetLanguage: 'zh',
        autoTranslate: true,
        showDefinitions: true,
        practiceReminders: true,
        dailyGoal: 10
      };
      this.updateSettingsUI();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  updateSettingsUI() {
    const targetLangSelect = document.getElementById('targetLang');
    const autoTranslateCheckbox = document.getElementById('autoTranslate');
    
    if (targetLangSelect) {
      targetLangSelect.value = this.settings.targetLanguage || 'zh';
    }
    
    if (autoTranslateCheckbox) {
      autoTranslateCheckbox.checked = this.settings.autoTranslate !== false;
    }
  }

  setupEventListeners() {
    // Quick action buttons
    document.getElementById('practiceBtn')?.addEventListener('click', this.openPractice.bind(this));
    document.getElementById('reviewBtn')?.addEventListener('click', this.openReview.bind(this));
    document.getElementById('viewAllBtn')?.addEventListener('click', this.openVocabulary.bind(this));
    
    // Footer buttons
    document.getElementById('optionsBtn')?.addEventListener('click', this.openOptions.bind(this));
    document.getElementById('helpBtn')?.addEventListener('click', this.openHelp.bind(this));
    
    // Settings
    document.getElementById('targetLang')?.addEventListener('change', this.updateTargetLanguage.bind(this));
    document.getElementById('autoTranslate')?.addEventListener('change', this.updateAutoTranslate.bind(this));
  }

  async loadData() {
    await Promise.all([
      this.loadRecentVocabulary(),
      this.loadStats(),
      this.loadDailyProgress()
    ]);
  }

  async loadRecentVocabulary() {
    try {
      const recentWords = await this.vocabularyDB.getVocabulary(5, 0);
      this.displayRecentWords(recentWords);
    } catch (error) {
      console.error('Failed to load recent vocabulary:', error);
      this.displayEmptyState();
    }
  }

  displayRecentWords(words) {
    const container = document.getElementById('recentWords');
    
    if (!words || words.length === 0) {
      this.displayEmptyState();
      return;
    }

    container.innerHTML = words.map(word => `
      <div class="vocabulary-item" data-word-id="${word.id}">
        <div class="word-info">
          <div class="word-text">${this.escapeHtml(word.word)}</div>
          <div class="word-translation">${this.escapeHtml(word.translation)}</div>
        </div>
        <div class="word-actions">
          <button class="word-action-btn" onclick="remwordPopup.practiceWord(${word.id})" title="Practice">🎯</button>
          <button class="word-action-btn" onclick="remwordPopup.deleteWord(${word.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  displayEmptyState() {
    const container = document.getElementById('recentWords');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">No vocabulary yet</div>
        <div class="empty-state-subtext">Start selecting text on web pages to build your vocabulary!</div>
      </div>
    `;
  }

  async loadStats() {
    try {
      const vocabulary = await this.vocabularyDB.getVocabulary(1000, 0);
      const totalWords = vocabulary.length;
      
      // Calculate streak (simplified - count consecutive days with vocabulary)
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayStart = new Date(checkDate.setHours(0, 0, 0, 0)).getTime();
        const dayEnd = new Date(checkDate.setHours(23, 59, 59, 999)).getTime();
        
        const wordsThisDay = vocabulary.filter(word => 
          word.timestamp >= dayStart && word.timestamp <= dayEnd
        );
        
        if (wordsThisDay.length > 0) {
          if (i === 0 || streak === i) {
            streak = i + 1;
          }
        } else if (i === 0) {
          break;
        }
      }
      
      document.getElementById('totalWords').textContent = totalWords;
      document.getElementById('streakDays').textContent = streak;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async loadDailyProgress() {
    try {
      const today = new Date();
      const dayStart = new Date(today.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime();
      
      const vocabulary = await this.vocabularyDB.getVocabulary(1000, 0);
      const todayWords = vocabulary.filter(word => 
        word.timestamp >= dayStart && word.timestamp <= dayEnd
      );
      
      const current = todayWords.length;
      const goal = this.settings.dailyGoal || 10;
      const percentage = Math.min((current / goal) * 100, 100);
      
      document.getElementById('progressCurrent').textContent = current;
      document.getElementById('progressGoal').textContent = goal;
      document.getElementById('progressFill').style.width = `${percentage}%`;
    } catch (error) {
      console.error('Failed to load daily progress:', error);
    }
  }

  async practiceWord(wordId) {
    // Open practice mode with specific word
    chrome.tabs.create({
      url: chrome.runtime.getURL(`options/options.html#practice?word=${wordId}`)
    });
  }

  async deleteWord(wordId) {
    if (confirm('Are you sure you want to delete this word?')) {
      try {
        await this.vocabularyDB.deleteVocabulary(wordId);
        await this.loadData(); // Refresh the display
      } catch (error) {
        console.error('Failed to delete word:', error);
        alert('Failed to delete word. Please try again.');
      }
    }
  }

  openPractice() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html#practice')
    });
  }

  openReview() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html#vocabulary')
    });
  }

  openVocabulary() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html#vocabulary')
    });
  }

  openOptions() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html')
    });
  }

  openHelp() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html#help')
    });
  }

  async updateTargetLanguage(event) {
    this.settings.targetLanguage = event.target.value;
    await this.saveSettings();
  }

  async updateAutoTranslate(event) {
    this.settings.autoTranslate = event.target.checked;
    await this.saveSettings();
  }

  async saveSettings() {
    try {
      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: this.settings
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize popup when DOM is loaded
let remwordPopup;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    remwordPopup = new RemWordPopup();
  });
} else {
  remwordPopup = new RemWordPopup();
}
