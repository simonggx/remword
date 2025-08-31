// RemWord Options Page JavaScript
class RemWordOptions {
  constructor() {
    this.vocabularyDB = new VocabularyDB();
    this.practiceExercises = null;
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.currentVocabulary = [];
    this.filteredVocabulary = [];
    this.settings = {};
    
    this.init();
  }

  async init() {
    await this.vocabularyDB.init();
    this.practiceExercises = new PracticeExercises(this.vocabularyDB);
    
    this.setupNavigation();
    this.setupEventListeners();
    await this.loadSettings();
    await this.loadInitialData();
    
    // Handle URL hash for direct navigation
    this.handleHashNavigation();
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show corresponding section
        const sectionId = link.dataset.section;
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        
        // Update URL hash
        window.location.hash = sectionId;
        
        // Load section-specific data
        this.loadSectionData(sectionId);
      });
    });
  }

  handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const targetLink = document.querySelector(`[data-section="${hash}"]`);
      if (targetLink) {
        targetLink.click();
      }
    }
  }

  setupEventListeners() {
    // Practice mode buttons
    document.querySelectorAll('.practice-card button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.closest('.practice-card').dataset.mode;
        this.practiceExercises.startPractice(mode);
      });
    });

    // Exit practice button
    document.getElementById('exitPractice')?.addEventListener('click', () => {
      this.practiceExercises.exitPractice();
    });

    // Vocabulary search and filters
    document.getElementById('vocabSearch')?.addEventListener('input', this.handleVocabularySearch.bind(this));
    document.getElementById('languageFilter')?.addEventListener('change', this.handleVocabularyFilter.bind(this));
    document.getElementById('masteryFilter')?.addEventListener('change', this.handleVocabularyFilter.bind(this));
    document.getElementById('clearFilters')?.addEventListener('click', this.clearVocabularyFilters.bind(this));

    // Pagination
    document.getElementById('prevPage')?.addEventListener('click', () => this.changePage(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => this.changePage(1));

    // Settings
    document.getElementById('saveSettings')?.addEventListener('click', this.saveSettings.bind(this));
    document.getElementById('resetSettings')?.addEventListener('click', this.resetSettings.bind(this));

    // Data management
    document.getElementById('exportData')?.addEventListener('click', this.exportData.bind(this));
    document.getElementById('importData')?.addEventListener('click', this.importData.bind(this));
    document.getElementById('clearAllData')?.addEventListener('click', this.clearAllData.bind(this));
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
    const elements = {
      defaultTargetLang: document.getElementById('defaultTargetLang'),
      autoTranslateEnabled: document.getElementById('autoTranslateEnabled'),
      showDefinitions: document.getElementById('showDefinitions'),
      practiceReminders: document.getElementById('practiceReminders'),
      dailyGoalSetting: document.getElementById('dailyGoalSetting')
    };

    if (elements.defaultTargetLang) elements.defaultTargetLang.value = this.settings.targetLanguage || 'zh';
    if (elements.autoTranslateEnabled) elements.autoTranslateEnabled.checked = this.settings.autoTranslate !== false;
    if (elements.showDefinitions) elements.showDefinitions.checked = this.settings.showDefinitions !== false;
    if (elements.practiceReminders) elements.practiceReminders.checked = this.settings.practiceReminders !== false;
    if (elements.dailyGoalSetting) elements.dailyGoalSetting.value = this.settings.dailyGoal || 10;
  }

  async loadInitialData() {
    await this.loadDashboardData();
    await this.loadVocabularyData();
  }

  async loadSectionData(sectionId) {
    switch (sectionId) {
      case 'dashboard':
        await this.loadDashboardData();
        break;
      case 'vocabulary':
        await this.loadVocabularyData();
        break;
    }
  }

  async loadDashboardData() {
    try {
      const vocabulary = await this.vocabularyDB.getVocabulary(1000, 0);
      const progressStats = await this.vocabularyDB.getProgressStats();
      const weeklyProgress = await this.vocabularyDB.getWeeklyProgress();

      // Calculate streak
      let streak = 0;
      const today = new Date();
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

      // Update dashboard stats
      document.getElementById('dashTotalWords').textContent = vocabulary.length;
      document.getElementById('dashStreak').textContent = streak;
      document.getElementById('dashMastered').textContent = progressStats.masteredWords;
      document.getElementById('dashAccuracy').textContent = `${progressStats.averageAccuracy}%`;

      // Load recent activity and weekly chart
      this.loadRecentActivity(vocabulary.slice(0, 5));
      this.loadWeeklyChart(weeklyProgress);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  loadRecentActivity(recentWords) {
    const container = document.getElementById('recentActivity');
    if (!container) return;

    if (recentWords.length === 0) {
      container.innerHTML = '<p>No recent activity</p>';
      return;
    }

    container.innerHTML = recentWords.map(word => `
      <div class="activity-item">
        <div class="activity-icon">📚</div>
        <div class="activity-content">
          <div class="activity-text">Added "${word.word}"</div>
          <div class="activity-time">${this.formatDate(word.timestamp)}</div>
        </div>
      </div>
    `).join('');
  }

  loadWeeklyChart(weeklyData) {
    const container = document.getElementById('weeklyChart');
    if (!container) return;

    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);
    const chartHTML = weeklyData.map(day => {
      const height = (day.count / maxCount) * 100;
      const dayName = day.date.toLocaleDateString('en', { weekday: 'short' });

      return `
        <div class="chart-bar" title="${day.count} words on ${day.date.toLocaleDateString()}">
          <div class="bar-fill" style="height: ${height}%"></div>
          <div class="bar-label">${dayName}</div>
          <div class="bar-count">${day.count}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="chart-container">
        ${chartHTML}
      </div>
    `;
  }

  async loadVocabularyData() {
    try {
      this.currentVocabulary = await this.vocabularyDB.getVocabulary(1000, 0);
      this.filteredVocabulary = [...this.currentVocabulary];
      this.currentPage = 1;
      this.renderVocabularyTable();
    } catch (error) {
      console.error('Failed to load vocabulary data:', error);
    }
  }

  handleVocabularySearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    this.filteredVocabulary = this.currentVocabulary.filter(word =>
      word.word.toLowerCase().includes(searchTerm) ||
      word.translation.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.renderVocabularyTable();
  }

  handleVocabularyFilter() {
    const languageFilter = document.getElementById('languageFilter').value;
    const masteryFilter = document.getElementById('masteryFilter').value;
    
    this.filteredVocabulary = this.currentVocabulary.filter(word => {
      let matches = true;
      
      if (languageFilter && word.language !== languageFilter) {
        matches = false;
      }
      
      // Mastery filter would need progress data
      // if (masteryFilter && word.masteryLevel !== parseInt(masteryFilter)) {
      //   matches = false;
      // }
      
      return matches;
    });
    
    this.currentPage = 1;
    this.renderVocabularyTable();
  }

  clearVocabularyFilters() {
    document.getElementById('vocabSearch').value = '';
    document.getElementById('languageFilter').value = '';
    document.getElementById('masteryFilter').value = '';
    this.filteredVocabulary = [...this.currentVocabulary];
    this.currentPage = 1;
    this.renderVocabularyTable();
  }

  renderVocabularyTable() {
    const tbody = document.getElementById('vocabularyTableBody');
    if (!tbody) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = this.filteredVocabulary.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No vocabulary found</td></tr>';
      return;
    }

    tbody.innerHTML = pageItems.map(word => `
      <tr>
        <td><strong>${this.escapeHtml(word.word)}</strong></td>
        <td>${this.escapeHtml(word.translation)}</td>
        <td title="${this.escapeHtml(word.context)}">${this.truncateText(word.context, 50)}</td>
        <td><a href="${word.sourceUrl}" target="_blank" title="${word.sourceUrl}">${this.getDomain(word.sourceUrl)}</a></td>
        <td><span class="mastery-badge mastery-0">New</span></td>
        <td>${this.formatDate(word.timestamp)}</td>
        <td>
          <button onclick="remwordOptions.deleteVocabulary(${word.id})" class="btn btn-sm btn-danger">Delete</button>
        </td>
      </tr>
    `).join('');

    this.updatePagination();
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredVocabulary.length / this.itemsPerPage);
    
    document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = this.currentPage === 1;
    document.getElementById('nextPage').disabled = this.currentPage === totalPages;
  }

  changePage(direction) {
    const totalPages = Math.ceil(this.filteredVocabulary.length / this.itemsPerPage);
    const newPage = this.currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.renderVocabularyTable();
    }
  }

  async deleteVocabulary(id) {
    if (confirm('Are you sure you want to delete this vocabulary item?')) {
      try {
        await this.vocabularyDB.deleteVocabulary(id);
        await this.loadVocabularyData();
      } catch (error) {
        console.error('Failed to delete vocabulary:', error);
        alert('Failed to delete vocabulary item.');
      }
    }
  }

  async saveSettings() {
    try {
      this.settings = {
        targetLanguage: document.getElementById('defaultTargetLang').value,
        autoTranslate: document.getElementById('autoTranslateEnabled').checked,
        showDefinitions: document.getElementById('showDefinitions').checked,
        practiceReminders: document.getElementById('practiceReminders').checked,
        dailyGoal: parseInt(document.getElementById('dailyGoalSetting').value)
      };

      await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: this.settings
      });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      this.settings = {
        targetLanguage: 'zh',
        autoTranslate: true,
        showDefinitions: true,
        practiceReminders: true,
        dailyGoal: 10
      };
      
      this.updateSettingsUI();
      await this.saveSettings();
    }
  }

  async exportData() {
    try {
      const vocabulary = await this.vocabularyDB.getVocabulary(10000, 0);
      const dataStr = JSON.stringify(vocabulary, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `remword-vocabulary-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data.');
    }
  }

  async importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (Array.isArray(data)) {
          for (const item of data) {
            if (item.word && item.translation) {
              await this.vocabularyDB.addVocabulary(item);
            }
          }
          
          alert(`Successfully imported ${data.length} vocabulary items!`);
          await this.loadVocabularyData();
        } else {
          alert('Invalid file format.');
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data.');
      }
    };
    
    input.click();
  }

  async clearAllData() {
    if (confirm('Are you sure you want to delete ALL vocabulary data? This cannot be undone!')) {
      if (confirm('This will permanently delete all your saved words. Are you absolutely sure?')) {
        try {
          await this.vocabularyDB.clearAllData();
          alert('All data has been cleared.');
          await this.loadInitialData();
        } catch (error) {
          console.error('Failed to clear data:', error);
          alert('Failed to clear data.');
        }
      }
    }
  }

  // Utility methods
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return 'Unknown';
    }
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
}

// Initialize options page
let remwordOptions;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    remwordOptions = new RemWordOptions();
  });
} else {
  remwordOptions = new RemWordOptions();
}
