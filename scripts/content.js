// Content script for text selection and translation
class RemWordContent {
  constructor() {
    this.translationService = new TranslationService();
    this.vocabularyDB = new VocabularyDB();
    this.popup = null;
    this.selectedText = '';
    this.selectionRange = null;
    this.isPopupVisible = false;
    
    this.init();
  }

  async init() {
    await this.vocabularyDB.init();
    this.setupEventListeners();
    this.loadScripts();
  }

  loadScripts() {
    // Load required scripts if not already loaded
    if (!window.TranslationService) {
      const script1 = document.createElement('script');
      script1.src = chrome.runtime.getURL('scripts/translation.js');
      document.head.appendChild(script1);
    }
    
    if (!window.VocabularyDB) {
      const script2 = document.createElement('script');
      script2.src = chrome.runtime.getURL('scripts/database.js');
      document.head.appendChild(script2);
    }
  }

  setupEventListeners() {
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Handle clicks outside popup to close it
    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target)) {
        this.hidePopup();
      }
    });
  }

  handleMouseDown(e) {
    // Hide popup when starting a new selection
    if (this.isPopupVisible && !this.popup.contains(e.target)) {
      this.hidePopup();
    }
  }

  handleKeyDown(e) {
    // Hide popup on Escape key
    if (e.key === 'Escape' && this.isPopupVisible) {
      this.hidePopup();
    }
  }

  async handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length === 0) {
      this.hidePopup();
      return;
    }

    // Only show popup for meaningful text (more than 1 character, contains letters)
    if (selectedText.length < 2 || !/[a-zA-Z\u4e00-\u9fff]/.test(selectedText)) {
      return;
    }

    this.selectedText = selectedText;
    this.selectionRange = selection.getRangeAt(0);
    
    // Get selection position for popup placement
    const rect = this.selectionRange.getBoundingClientRect();
    const x = rect.left + (rect.width / 2);
    const y = rect.top - 10;
    
    await this.showTranslationPopup(x, y);
  }

  async showTranslationPopup(x, y) {
    this.hidePopup(); // Hide any existing popup
    
    // Create popup element
    this.popup = document.createElement('div');
    this.popup.className = 'remword-popup';
    this.popup.innerHTML = `
      <div class="remword-popup-content">
        <div class="remword-popup-header">
          <span class="remword-selected-text">${this.escapeHtml(this.selectedText)}</span>
          <button class="remword-close-btn">&times;</button>
        </div>
        <div class="remword-popup-body">
          <div class="remword-loading">Translating...</div>
        </div>
        <div class="remword-popup-actions">
          <button class="remword-save-btn" disabled>Save to Vocabulary</button>
          <button class="remword-definition-btn">Get Definition</button>
        </div>
      </div>
    `;
    
    // Position popup
    this.popup.style.left = `${x}px`;
    this.popup.style.top = `${y}px`;
    
    document.body.appendChild(this.popup);
    this.isPopupVisible = true;
    
    // Setup popup event listeners
    this.setupPopupEventListeners();
    
    // Get translation
    await this.loadTranslation();
    
    // Adjust position if popup goes off screen
    this.adjustPopupPosition();
  }

  setupPopupEventListeners() {
    const closeBtn = this.popup.querySelector('.remword-close-btn');
    const saveBtn = this.popup.querySelector('.remword-save-btn');
    const definitionBtn = this.popup.querySelector('.remword-definition-btn');
    
    closeBtn.addEventListener('click', () => this.hidePopup());
    saveBtn.addEventListener('click', () => this.saveToVocabulary());
    definitionBtn.addEventListener('click', () => this.loadDefinition());
  }

  async loadTranslation() {
    try {
      const translation = await this.translationService.translateText(this.selectedText);
      
      const bodyElement = this.popup.querySelector('.remword-popup-body');
      bodyElement.innerHTML = `
        <div class="remword-translation">
          <strong>Translation:</strong> ${this.escapeHtml(translation.translatedText)}
        </div>
        <div class="remword-confidence">
          Confidence: ${Math.round((translation.confidence || 0.8) * 100)}%
        </div>
      `;
      
      // Enable save button
      const saveBtn = this.popup.querySelector('.remword-save-btn');
      saveBtn.disabled = false;
      saveBtn.dataset.translation = translation.translatedText;
      
    } catch (error) {
      console.error('Translation error:', error);
      const bodyElement = this.popup.querySelector('.remword-popup-body');
      bodyElement.innerHTML = `
        <div class="remword-error">Translation failed. Please try again.</div>
      `;
    }
  }

  async loadDefinition() {
    const bodyElement = this.popup.querySelector('.remword-popup-body');
    const currentContent = bodyElement.innerHTML;
    
    bodyElement.innerHTML = currentContent + '<div class="remword-loading">Loading definition...</div>';
    
    try {
      const definition = await this.translationService.getWordDefinition(this.selectedText);
      
      if (definition) {
        const definitionHtml = `
          <div class="remword-definition">
            <strong>Definition:</strong>
            ${definition.phonetic ? `<div class="remword-phonetic">${definition.phonetic}</div>` : ''}
            ${definition.definitions.map(meaning => `
              <div class="remword-meaning">
                <em>${meaning.partOfSpeech}</em>
                <ul>
                  ${meaning.definitions.map(def => `<li>${def}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        `;
        
        bodyElement.innerHTML = currentContent + definitionHtml;
      } else {
        bodyElement.innerHTML = currentContent + '<div class="remword-error">Definition not found.</div>';
      }
    } catch (error) {
      console.error('Definition error:', error);
      bodyElement.innerHTML = currentContent + '<div class="remword-error">Failed to load definition.</div>';
    }
  }

  async saveToVocabulary() {
    const saveBtn = this.popup.querySelector('.remword-save-btn');
    const translation = saveBtn.dataset.translation;
    
    if (!translation) {
      alert('No translation available to save.');
      return;
    }
    
    try {
      // Get context sentence (surrounding text)
      const context = this.getContextSentence();
      
      const vocabularyData = {
        word: this.selectedText,
        translation: translation,
        context: context,
        sourceUrl: window.location.href,
        language: await this.translationService.detectLanguage(this.selectedText)
      };
      
      await this.vocabularyDB.addVocabulary(vocabularyData);
      
      // Update button to show success
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
      saveBtn.style.backgroundColor = '#4CAF50';
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'remword-success';
      successMsg.textContent = 'Word saved to vocabulary!';
      this.popup.querySelector('.remword-popup-body').appendChild(successMsg);
      
      // Auto-hide popup after 2 seconds
      setTimeout(() => this.hidePopup(), 2000);
      
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save vocabulary. Please try again.');
    }
  }

  getContextSentence() {
    if (!this.selectionRange) return '';
    
    try {
      // Get the text content of the parent element
      const parentElement = this.selectionRange.commonAncestorContainer.parentElement || 
                           this.selectionRange.commonAncestorContainer;
      const fullText = parentElement.textContent || '';
      
      // Find the selected text within the full text
      const selectedIndex = fullText.indexOf(this.selectedText);
      if (selectedIndex === -1) return this.selectedText;
      
      // Extract sentence containing the selected text
      const beforeText = fullText.substring(0, selectedIndex);
      const afterText = fullText.substring(selectedIndex + this.selectedText.length);
      
      // Find sentence boundaries
      const sentenceStart = Math.max(
        beforeText.lastIndexOf('.'),
        beforeText.lastIndexOf('!'),
        beforeText.lastIndexOf('?'),
        beforeText.lastIndexOf('\n')
      );
      
      const sentenceEnd = Math.min(
        afterText.indexOf('.') !== -1 ? afterText.indexOf('.') + selectedIndex + this.selectedText.length : fullText.length,
        afterText.indexOf('!') !== -1 ? afterText.indexOf('!') + selectedIndex + this.selectedText.length : fullText.length,
        afterText.indexOf('?') !== -1 ? afterText.indexOf('?') + selectedIndex + this.selectedText.length : fullText.length,
        afterText.indexOf('\n') !== -1 ? afterText.indexOf('\n') + selectedIndex + this.selectedText.length : fullText.length
      );
      
      const contextSentence = fullText.substring(sentenceStart + 1, sentenceEnd).trim();
      return contextSentence || this.selectedText;
      
    } catch (error) {
      console.error('Context extraction error:', error);
      return this.selectedText;
    }
  }

  adjustPopupPosition() {
    if (!this.popup) return;
    
    const rect = this.popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      this.popup.style.left = `${viewportWidth - rect.width - 10}px`;
    }
    if (rect.left < 0) {
      this.popup.style.left = '10px';
    }
    
    // Adjust vertical position
    if (rect.top < 0) {
      this.popup.style.top = '10px';
    }
    if (rect.bottom > viewportHeight) {
      this.popup.style.top = `${viewportHeight - rect.height - 10}px`;
    }
  }

  hidePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
      this.isPopupVisible = false;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the content script
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RemWordContent();
  });
} else {
  new RemWordContent();
}
