// Translation service for RemWord extension
class TranslationService {
  constructor() {
    this.cache = new Map();
    this.apiEndpoints = {
      // Using multiple free translation services as fallbacks
      libre: 'https://libretranslate.de/translate',
      mymemory: 'https://api.mymemory.translated.net/get'
    };
  }

  async translateText(text, targetLang = 'zh', sourceLang = 'auto') {
    const cacheKey = `${text}_${sourceLang}_${targetLang}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Try MyMemory API first (free, no API key required)
      const translation = await this.translateWithMyMemory(text, targetLang, sourceLang);
      
      if (translation) {
        this.cache.set(cacheKey, translation);
        return translation;
      }
    } catch (error) {
      console.warn('MyMemory translation failed:', error);
    }

    try {
      // Fallback to LibreTranslate
      const translation = await this.translateWithLibre(text, targetLang, sourceLang);
      
      if (translation) {
        this.cache.set(cacheKey, translation);
        return translation;
      }
    } catch (error) {
      console.warn('LibreTranslate failed:', error);
    }

    // If all APIs fail, return a basic response
    return {
      translatedText: `Translation unavailable for: ${text}`,
      sourceLanguage: sourceLang,
      confidence: 0
    };
  }

  async translateWithMyMemory(text, targetLang, sourceLang) {
    const langPair = sourceLang === 'auto' ? `en|${targetLang}` : `${sourceLang}|${targetLang}`;
    const url = `${this.apiEndpoints.mymemory}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.responseStatus === 200) {
      return {
        translatedText: data.responseData.translatedText,
        sourceLanguage: sourceLang,
        confidence: data.responseData.match
      };
    }
    
    throw new Error('MyMemory API error');
  }

  async translateWithLibre(text, targetLang, sourceLang) {
    const response = await fetch(this.apiEndpoints.libre, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });
    
    const data = await response.json();
    
    if (data.translatedText) {
      return {
        translatedText: data.translatedText,
        sourceLanguage: data.detectedLanguage?.language || sourceLang,
        confidence: data.detectedLanguage?.confidence || 0.8
      };
    }
    
    throw new Error('LibreTranslate API error');
  }

  async detectLanguage(text) {
    // Simple language detection based on character patterns
    const hasChineseChars = /[\u4e00-\u9fff]/.test(text);
    const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
    const hasKoreanChars = /[\uac00-\ud7af]/.test(text);
    const hasArabicChars = /[\u0600-\u06ff]/.test(text);
    const hasRussianChars = /[\u0400-\u04ff]/.test(text);
    
    if (hasChineseChars) return 'zh';
    if (hasJapaneseChars) return 'ja';
    if (hasKoreanChars) return 'ko';
    if (hasArabicChars) return 'ar';
    if (hasRussianChars) return 'ru';
    
    // Default to English for Latin characters
    return 'en';
  }

  async getWordDefinition(word) {
    try {
      // Use a free dictionary API for English definitions
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        const meanings = entry.meanings || [];
        
        const definitions = meanings.map(meaning => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.slice(0, 2).map(def => def.definition)
        }));
        
        return {
          word: entry.word,
          phonetic: entry.phonetic || '',
          definitions: definitions,
          sourceUrls: entry.sourceUrls || []
        };
      }
    } catch (error) {
      console.warn('Dictionary API failed:', error);
    }
    
    return null;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TranslationService;
} else {
  window.TranslationService = TranslationService;
}
