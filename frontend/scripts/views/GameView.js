const GameView = {
  template:
  `
    <div class="game-container" v-show="!showResult">
    <div class="question-container">
        <h2>{{ currentQuestion.question }}</h2>
    </div>
    <div class="options-container">
        <div
        class="option-a"
        :class="selectColor('a')"
        @click="handleOptionClick('a')"
        >
        {{ currentQuestion.option_a }}
        </div>
        <div
        class="option-b"
        :class="selectColor('b')"
        @click="handleOptionClick('b')"
        >
        {{ currentQuestion.option_b }}
        </div>
        <div
        class="option-c"
        :class="selectColor('c')"
        @click="handleOptionClick('c')"
        >
        {{ currentQuestion.option_c }}
        </div>
        <div
        class="option-d"
        :class="selectColor('d')"
        @click="handleOptionClick('d')"
        >
        {{ currentQuestion.option_d }}
        </div>
        <div class="timer">
        <h3>Time left: {{ timer }} seconds</h3>
        </div>
    </div>
    <div class="progress">
        Q {{ currentQuestionIndex + 1 }} / {{ questions.length || 5 }}
    </div>

    <div v-if="showEndGameModal" class="modal-overlay">
    <div class="modal-content">
        <h2>🎉 Quiz Complete!</h2>
        <p>You got <strong>{{ correctAnswerCount }}</strong> out of {{ questions.length }} correct.</p>
        <p v-if="pointsEarned !== null">Points earned: <strong>{{ pointsEarned }}</strong></p>
        <p v-if="newPoints !== null">Your new total: <strong>{{ newPoints }}</strong></p>
        <div class="modal-buttons">
        <button class="btn primary" @click="resetGameToStartScreen">Play Again</button> <button class="btn danger" @click="closeEndGameModal">Close</button>
        </div>
    </div>
    </div>
  `,
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      correctAnswerCount: 0,
      currentQuestion: {
        question: 'Loading question...',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: ''
      },
      selectedOption: null,
      timer: 10,
      intervalId: null,
      showResult: false,
      showStart: true, // Initially show the "Start Game" button
      userAnswers: [],
      pointsEarned: null,
      newPoints: null,
      showEndGameModal: false,
    };
  },

  async mounted() { // Changed to async to await fetchQuestions
    await this.fetchQuestions(); // Wait for questions to load
    // After questions are loaded and currentQuestion is set, start the timer
    if (this.questions.length > 0) {
      this.startTimer();
    } else {
      // Handle case where no questions were fetched (e.g., show an error message)
      console.error("No questions available to start the game.");
      alert("Could not load quiz questions. Please try again later.");
    }
  },

  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get('http://localhost:8080/game/questions', { withCredentials: true });
        this.questions = response.data.map((q) => ({
          id: q.question_id,
          question: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
        }));
        // Set the current question to the first one ONLY if questions were fetched successfully
        if (this.questions.length > 0) {
            this.currentQuestion = this.questions[0];
        }
        console.log('Loaded questions:', this.questions);
      } catch (error) {
        console.error('Failed to fetch questions:', error.response || error.message || error);
        alert('Error fetching questions from the server.');
      }
    },

    // NEW: Function to start the game from the initial screen
    startGame() {
      if (this.questions.length === 0) {
        alert('No questions loaded. Please check your internet connection or server.');
        return;
      }
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.correctAnswerCount = 0;
      this.userAnswers = [];
      this.pointsEarned = null;
      this.newPoints = null;
      this.selectedOption = null;
      this.timer = 10;
      this.showEndGameModal = false; // Hide the modal
      this.showStart = false; // Hide the "Start Game" button
      this.showResult = false; // Show the game content (game-container)
      this.startTimer();
    },

    isCorrect(option) {
      return this.currentQuestion.correct_answer === this.currentQuestion[`option_${option}`];
    },

    selectOption(option) {
      this.selectedOption = option;
    },

    selectColor(option) {
      if (!this.selectedOption) {
        return ''; // No option has been selected yet
      }

      const correctOptionText = this.currentQuestion.correct_answer;
      const optionText = this.currentQuestion[`option_${option}`];
      const selectedOptionText = this.currentQuestion[`option_${this.selectedOption}`];

      // If this option is the correct answer
      if (optionText === correctOptionText) {
        return 'correct';
      }

      // If this option is the one the user selected AND it's not the correct answer
      if (optionText === selectedOptionText && optionText !== correctOptionText) {
        return 'wrong';
      }

      // Otherwise, no specific color
      return '';
    },

    handleOptionClick(option) {
      if (this.selectedOption) return;

      this.selectedOption = option;

      this.userAnswers[this.currentQuestionIndex] = {
            question_id: this.currentQuestion.id,
            user_answer: this.currentQuestion[`option_${option}`]
        };
        if(this.isCorrect(option)) {
            this.correctAnswerCount++;
        }
        clearInterval(this.intervalId);

        setTimeout(() => {
            this.nextQuestion();
            this.selectedOption = null
        }, 1000);
    },

    nextQuestion() {
      if (!this.selectedOption && this.timer === 0 && this.currentQuestionIndex < this.questions.length) {
        this.userAnswers[this.currentQuestionIndex] = {
            question_id: this.currentQuestion.id,
            user_answer: null
        };
      }

      if (this.currentQuestionIndex + 1 < this.questions.length) {
        this.currentQuestionIndex++;
        this.currentQuestion = this.questions[this.currentQuestionIndex];
        this.timer = 10;
        this.startTimer();
      } else {
        clearInterval(this.intervalId);
        this.timer = 0;
        this.submitAnswers();
      }
    },

    startTimer() {
      clearInterval(this.intervalId);

      this.intervalId = setInterval(() => {
        this.timer--;
        if (this.timer === 0) {
          clearInterval(this.intervalId);
          if (!this.selectedOption) {
            this.userAnswers[this.currentQuestionIndex] = {
                question_id: this.currentQuestion.id,
                user_answer: null
            };
          }
          this.nextQuestion();
        }
      }, 1000);
    },

    // NEW: Function to reset the game back to the start screen state
    resetGameToStartScreen() {
      this.currentQuestionIndex = 0;
      this.correctAnswerCount = 0;
      this.userAnswers = [];
      this.pointsEarned = null;
      this.newPoints = null;
      this.selectedOption = null;
      this.timer = 10;
      clearInterval(this.intervalId); // Stop any running timer
      this.showEndGameModal = false; // Hide the end game modal
      this.showResult = false; // Ensure game container is hidden initially (v-show="!showResult")
      this.showStart = true; // Show the "Start Game" button

      // Reset currentQuestion to the first one, or a placeholder if questions re-fetch
      if (this.questions.length > 0) {
          this.currentQuestion = this.questions[0];
      } else {
          // Fallback if questions array is empty (shouldn't happen with mounted fetch)
          this.currentQuestion = {
            question: 'Loading question...',
            option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: ''
          };
      }
      // Re-fetch questions here IF you want a new set of questions each time
      // For now, assuming questions are fetched once on mounted and reused.
      // If you uncomment this, you might need to call startGame() in its .then()
      // this.fetchQuestions();
    },

    closeEndGameModal() {
      this.showEndGameModal = false;
      this.showStart = true; // Show the start button again
      this.showResult = false; // Ensure game-container is hidden
    },

    submitAnswers() {
      axios.post('http://localhost:8080/game/check', { answers: this.userAnswers }, { withCredentials: true })
        .then((res) => {
          this.pointsEarned = res.data.totalAddedPoints;
          this.newPoints = res.data.newTotalPoints;
          this.correctAnswerCount = res.data.correct;
          this.showResult = false; // Hide the main game content
          this.showEndGameModal = true; // Show the end game modal
        })
        .catch((error) => {
          console.error('Failed to submit answers:', error.response || error.message || error);
          alert('Failed to submit answers. Please try again.');

          this.showEndGameModal = true; // Still show the modal, but the point info might be null
          this.showResult = false; // Hide the main game content
        });
    }
  }
};