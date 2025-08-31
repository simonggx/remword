// Database management for vocabulary storage using IndexedDB
class VocabularyDB {
  constructor() {
    this.dbName = 'RemWordDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create vocabulary store
        if (!db.objectStoreNames.contains('vocabulary')) {
          const vocabStore = db.createObjectStore('vocabulary', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          vocabStore.createIndex('word', 'word', { unique: false });
          vocabStore.createIndex('timestamp', 'timestamp', { unique: false });
          vocabStore.createIndex('sourceUrl', 'sourceUrl', { unique: false });
        }
        
        // Create practice sessions store
        if (!db.objectStoreNames.contains('practice_sessions')) {
          const practiceStore = db.createObjectStore('practice_sessions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          practiceStore.createIndex('timestamp', 'timestamp', { unique: false });
          practiceStore.createIndex('exerciseType', 'exerciseType', { unique: false });
        }
        
        // Create user progress store
        if (!db.objectStoreNames.contains('user_progress')) {
          const progressStore = db.createObjectStore('user_progress', { 
            keyPath: 'wordId' 
          });
          progressStore.createIndex('masteryLevel', 'masteryLevel', { unique: false });
          progressStore.createIndex('lastPracticed', 'lastPracticed', { unique: false });
        }
      };
    });
  }

  async addVocabulary(wordData) {
    const transaction = this.db.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    
    const vocabularyItem = {
      word: wordData.word,
      translation: wordData.translation,
      context: wordData.context,
      sourceUrl: wordData.sourceUrl,
      timestamp: Date.now(),
      language: wordData.language || 'en'
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(vocabularyItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getVocabulary(limit = 100, offset = 0) {
    const transaction = this.db.transaction(['vocabulary'], 'readonly');
    const store = transaction.objectStore('vocabulary');
    const index = store.index('timestamp');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results = [];
      let count = 0;
      let skipped = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && count < limit) {
          if (skipped >= offset) {
            results.push(cursor.value);
            count++;
          } else {
            skipped++;
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async searchVocabulary(searchTerm) {
    const transaction = this.db.transaction(['vocabulary'], 'readonly');
    const store = transaction.objectStore('vocabulary');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.filter(item => 
          item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.translation.toLowerCase().includes(searchTerm.toLowerCase())
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVocabulary(id) {
    const transaction = this.db.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateProgress(wordId, correct, exerciseType) {
    const transaction = this.db.transaction(['user_progress'], 'readwrite');
    const store = transaction.objectStore('user_progress');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(wordId);
      getRequest.onsuccess = () => {
        let progress = getRequest.result || {
          wordId: wordId,
          correctAnswers: 0,
          totalAttempts: 0,
          masteryLevel: 0,
          lastPracticed: Date.now()
        };
        
        progress.totalAttempts++;
        if (correct) progress.correctAnswers++;
        progress.lastPracticed = Date.now();
        
        // Calculate mastery level (0-5)
        const accuracy = progress.correctAnswers / progress.totalAttempts;
        if (progress.totalAttempts >= 5) {
          progress.masteryLevel = Math.floor(accuracy * 5);
        }
        
        const putRequest = store.put(progress);
        putRequest.onsuccess = () => resolve(progress);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getProgress(wordId) {
    const transaction = this.db.transaction(['user_progress'], 'readonly');
    const store = transaction.objectStore('user_progress');
    
    return new Promise((resolve, reject) => {
      const request = store.get(wordId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getRandomVocabularyForPractice(count = 10, excludeMastered = true) {
    const vocabulary = await this.getVocabulary(1000);
    let filtered = vocabulary;

    if (excludeMastered) {
      const masteredWords = new Set();
      const transaction = this.db.transaction(['user_progress'], 'readonly');
      const store = transaction.objectStore('user_progress');
      const index = store.index('masteryLevel');

      await new Promise((resolve) => {
        const request = index.openCursor(IDBKeyRange.lowerBound(4));
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            masteredWords.add(cursor.value.wordId);
            cursor.continue();
          } else {
            resolve();
          }
        };
      });

      filtered = vocabulary.filter(word => !masteredWords.has(word.id));
    }

    // Shuffle and return requested count
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getProgressStats() {
    const transaction = this.db.transaction(['user_progress'], 'readonly');
    const store = transaction.objectStore('user_progress');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const allProgress = request.result;
        const stats = {
          totalWords: allProgress.length,
          masteredWords: allProgress.filter(p => p.masteryLevel >= 4).length,
          averageAccuracy: 0,
          totalAttempts: 0,
          correctAnswers: 0
        };

        if (allProgress.length > 0) {
          stats.totalAttempts = allProgress.reduce((sum, p) => sum + p.totalAttempts, 0);
          stats.correctAnswers = allProgress.reduce((sum, p) => sum + p.correctAnswers, 0);
          stats.averageAccuracy = stats.totalAttempts > 0 ?
            Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;
        }

        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getWeeklyProgress() {
    const vocabulary = await this.getVocabulary(1000);
    const now = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

      const wordsThisDay = vocabulary.filter(word =>
        word.timestamp >= dayStart && word.timestamp <= dayEnd
      );

      weeklyData.push({
        date: new Date(dayStart),
        count: wordsThisDay.length
      });
    }

    return weeklyData;
  }

  async clearAllData() {
    const transaction = this.db.transaction(['vocabulary', 'practice_sessions', 'user_progress'], 'readwrite');

    const promises = [
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('vocabulary').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('practice_sessions').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('user_progress').clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ];

    return Promise.all(promises);
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VocabularyDB;
} else {
  window.VocabularyDB = VocabularyDB;
}
