// Practice Exercise System for RemWord
class PracticeExercises {
  constructor(vocabularyDB) {
    this.vocabularyDB = vocabularyDB;
    this.currentSession = null;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
    this.exerciseType = '';
  }

  async startPractice(mode, wordCount = 10) {
    this.exerciseType = mode;
    this.currentQuestionIndex = 0;
    this.score = 0;
    
    // Get vocabulary for practice
    const vocabulary = await this.vocabularyDB.getRandomVocabularyForPractice(wordCount);
    
    if (vocabulary.length === 0) {
      alert('No vocabulary available for practice. Please add some words first!');
      return;
    }

    // Generate questions based on mode
    this.questions = await this.generateQuestions(mode, vocabulary);
    
    // Show practice container
    document.getElementById('practiceContainer').style.display = 'block';
    document.querySelector('.practice-modes').style.display = 'none';
    
    // Update practice header
    document.getElementById('practiceTitle').textContent = this.getPracticeTitle(mode);
    
    // Start first question
    this.showQuestion();
  }

  getPracticeTitle(mode) {
    const titles = {
      'multiple-choice': 'Multiple Choice Practice',
      'fill-blank': 'Fill in the Blank',
      'matching': 'Word Matching',
      'context': 'Context Practice'
    };
    return titles[mode] || 'Practice Exercise';
  }

  async generateQuestions(mode, vocabulary) {
    const questions = [];
    
    for (const word of vocabulary) {
      let question;
      
      switch (mode) {
        case 'multiple-choice':
          question = await this.generateMultipleChoice(word, vocabulary);
          break;
        case 'fill-blank':
          question = await this.generateFillBlank(word);
          break;
        case 'matching':
          question = await this.generateMatching(word);
          break;
        case 'context':
          question = await this.generateContext(word);
          break;
      }
      
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }

  async generateMultipleChoice(correctWord, allWords) {
    // Get 3 random incorrect options
    const incorrectOptions = allWords
      .filter(w => w.id !== correctWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.translation);
    
    const options = [...incorrectOptions, correctWord.translation]
      .sort(() => 0.5 - Math.random());
    
    return {
      type: 'multiple-choice',
      word: correctWord,
      question: `What is the translation of "${correctWord.word}"?`,
      options: options,
      correctAnswer: correctWord.translation,
      context: correctWord.context
    };
  }

  async generateFillBlank(word) {
    if (!word.context || word.context.length < 10) {
      // Generate a simple sentence if no context
      return {
        type: 'fill-blank',
        word: word,
        question: `Complete the sentence: "The word _____ means ${word.translation}."`,
        correctAnswer: word.word,
        context: `The word _____ means ${word.translation}.`
      };
    }
    
    // Replace the word in context with blank
    const contextWithBlank = word.context.replace(
      new RegExp(`\\b${word.word}\\b`, 'gi'), 
      '_____'
    );
    
    return {
      type: 'fill-blank',
      word: word,
      question: 'Fill in the blank:',
      correctAnswer: word.word,
      context: contextWithBlank
    };
  }

  async generateMatching(word) {
    return {
      type: 'matching',
      word: word,
      question: `Match the word with its definition:`,
      wordToMatch: word.word,
      correctAnswer: word.translation,
      context: word.context
    };
  }

  async generateContext(word) {
    const contexts = [
      `Use "${word.word}" in a sentence about daily life.`,
      `How would you use "${word.word}" in a conversation?`,
      `Create a sentence using "${word.word}" that shows its meaning.`,
      `Write a short phrase with "${word.word}" in context.`
    ];
    
    return {
      type: 'context',
      word: word,
      question: contexts[Math.floor(Math.random() * contexts.length)],
      correctAnswer: word.translation,
      context: word.context,
      hint: `Hint: ${word.word} means ${word.translation}`
    };
  }

  showQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.showResults();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    const content = document.getElementById('practiceContent');
    
    // Update progress
    document.getElementById('practiceProgress').textContent = 
      `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
    
    // Generate question HTML based on type
    let questionHTML = '';
    
    switch (question.type) {
      case 'multiple-choice':
        questionHTML = this.renderMultipleChoice(question);
        break;
      case 'fill-blank':
        questionHTML = this.renderFillBlank(question);
        break;
      case 'matching':
        questionHTML = this.renderMatching(question);
        break;
      case 'context':
        questionHTML = this.renderContext(question);
        break;
    }
    
    content.innerHTML = questionHTML;
    
    // Add event listeners
    this.setupQuestionEventListeners(question);
  }

  renderMultipleChoice(question) {
    return `
      <div class="question-container">
        <h4>${question.question}</h4>
        ${question.context ? `<p class="question-context">"${question.context}"</p>` : ''}
        <div class="options-container">
          ${question.options.map((option, index) => `
            <button class="option-btn" data-answer="${option}">
              ${String.fromCharCode(65 + index)}. ${option}
            </button>
          `).join('')}
        </div>
        <div class="question-actions">
          <button id="submitAnswer" class="btn btn-primary" disabled>Submit Answer</button>
        </div>
        <div id="feedback" class="feedback"></div>
      </div>
    `;
  }

  renderFillBlank(question) {
    return `
      <div class="question-container">
        <h4>${question.question}</h4>
        <p class="question-context">${question.context}</p>
        <div class="input-container">
          <input type="text" id="answerInput" placeholder="Type your answer here..." class="answer-input">
        </div>
        <div class="question-actions">
          <button id="submitAnswer" class="btn btn-primary">Submit Answer</button>
        </div>
        <div id="feedback" class="feedback"></div>
      </div>
    `;
  }

  renderMatching(question) {
    return `
      <div class="question-container">
        <h4>${question.question}</h4>
        <div class="matching-container">
          <div class="word-to-match">
            <strong>${question.wordToMatch}</strong>
          </div>
          <div class="arrow">↓</div>
          <input type="text" id="answerInput" placeholder="Enter the translation..." class="answer-input">
        </div>
        ${question.context ? `<p class="question-context">Context: "${question.context}"</p>` : ''}
        <div class="question-actions">
          <button id="submitAnswer" class="btn btn-primary">Submit Answer</button>
        </div>
        <div id="feedback" class="feedback"></div>
      </div>
    `;
  }

  renderContext(question) {
    return `
      <div class="question-container">
        <h4>${question.question}</h4>
        <p class="question-hint">${question.hint}</p>
        <div class="input-container">
          <textarea id="answerInput" placeholder="Write your sentence here..." class="answer-textarea"></textarea>
        </div>
        <div class="question-actions">
          <button id="submitAnswer" class="btn btn-primary">Submit Answer</button>
        </div>
        <div id="feedback" class="feedback"></div>
      </div>
    `;
  }

  setupQuestionEventListeners(question) {
    const submitBtn = document.getElementById('submitAnswer');
    const answerInput = document.getElementById('answerInput');
    
    // Handle option selection for multiple choice
    if (question.type === 'multiple-choice') {
      const optionBtns = document.querySelectorAll('.option-btn');
      let selectedAnswer = '';
      
      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          optionBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedAnswer = btn.dataset.answer;
          submitBtn.disabled = false;
        });
      });
      
      submitBtn.addEventListener('click', () => {
        this.checkAnswer(selectedAnswer, question);
      });
    } else {
      // Handle text input
      if (answerInput) {
        answerInput.addEventListener('input', () => {
          submitBtn.disabled = answerInput.value.trim().length === 0;
        });
        
        answerInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !submitBtn.disabled) {
            this.checkAnswer(answerInput.value.trim(), question);
          }
        });
      }
      
      submitBtn.addEventListener('click', () => {
        const answer = answerInput ? answerInput.value.trim() : '';
        this.checkAnswer(answer, question);
      });
    }
  }

  checkAnswer(userAnswer, question) {
    const feedback = document.getElementById('feedback');
    const submitBtn = document.getElementById('submitAnswer');
    let isCorrect = false;
    
    // Check answer based on question type
    switch (question.type) {
      case 'multiple-choice':
      case 'matching':
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
        break;
      case 'fill-blank':
        isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
        break;
      case 'context':
        // For context questions, check if the word is used correctly
        isCorrect = userAnswer.toLowerCase().includes(question.word.word.toLowerCase());
        break;
    }
    
    if (isCorrect) {
      this.score++;
      feedback.innerHTML = `
        <div class="feedback-correct">
          ✅ Correct! 
          ${question.type === 'context' ? 'Good use of the word in context!' : ''}
        </div>
      `;
    } else {
      feedback.innerHTML = `
        <div class="feedback-incorrect">
          ❌ Incorrect. The correct answer is: <strong>${question.correctAnswer}</strong>
          ${question.context ? `<br>Context: "${question.context}"` : ''}
        </div>
      `;
    }
    
    // Update progress in database
    this.vocabularyDB.updateProgress(question.word.id, isCorrect, this.exerciseType);
    
    // Show next button
    submitBtn.style.display = 'none';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Finish' : 'Next Question';
    nextBtn.addEventListener('click', () => {
      this.currentQuestionIndex++;
      this.showQuestion();
    });
    
    feedback.appendChild(nextBtn);
  }

  showResults() {
    const content = document.getElementById('practiceContent');
    const accuracy = Math.round((this.score / this.questions.length) * 100);
    
    content.innerHTML = `
      <div class="results-container">
        <h3>Practice Complete!</h3>
        <div class="results-stats">
          <div class="result-stat">
            <div class="result-number">${this.score}</div>
            <div class="result-label">Correct</div>
          </div>
          <div class="result-stat">
            <div class="result-number">${this.questions.length - this.score}</div>
            <div class="result-label">Incorrect</div>
          </div>
          <div class="result-stat">
            <div class="result-number">${accuracy}%</div>
            <div class="result-label">Accuracy</div>
          </div>
        </div>
        <div class="results-actions">
          <button id="practiceAgain" class="btn btn-primary">Practice Again</button>
          <button id="backToModes" class="btn btn-secondary">Back to Modes</button>
        </div>
      </div>
    `;
    
    // Setup result actions
    document.getElementById('practiceAgain').addEventListener('click', () => {
      this.startPractice(this.exerciseType, this.questions.length);
    });
    
    document.getElementById('backToModes').addEventListener('click', () => {
      this.exitPractice();
    });
  }

  exitPractice() {
    document.getElementById('practiceContainer').style.display = 'none';
    document.querySelector('.practice-modes').style.display = 'grid';
    
    // Reset state
    this.currentSession = null;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
  }
}

// Export for use in options.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PracticeExercises;
} else {
  window.PracticeExercises = PracticeExercises;
}
