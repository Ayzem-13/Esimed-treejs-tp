export class DialogueManager {
    constructor() {
        this.questions = [];
        this.isLoaded = false;
        this.correctlyAnswered = []; 
        this.currentSessionAsked = []; 
        this.loadQuestions();
    }

    async loadQuestions() {
        try {
            const response = await fetch('/data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
            this.isLoaded = true;
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
            this.questions = [];
        }
    }

    getRandomQuestion() {
        if (!this.isLoaded || this.questions.length === 0) {
            return null;
        }

        if (this.correctlyAnswered.length >= 8) {
            return { victory: true };
        }

        // Trouver les questions disponibles 
        const availableIndices = this.questions
            .map((_, idx) => idx)
            .filter(idx => !this.correctlyAnswered.includes(idx) && !this.currentSessionAsked.includes(idx));

        // Si plus de questions disponibles cette session
        if (availableIndices.length === 0) {
            this.resetSession();
            // Recharger les questions disponibles après reset
            const newAvailableIndices = this.questions
                .map((_, idx) => idx)
                .filter(idx => !this.correctlyAnswered.includes(idx));
            
            if (newAvailableIndices.length === 0) {
                return { victory: true };
            }
            
            const randomIndex = newAvailableIndices[Math.floor(Math.random() * newAvailableIndices.length)];
            const question = this.questions[randomIndex];
            this.currentSessionAsked.push(randomIndex);
            
            return {
                ...question,
                questionIndex: randomIndex,
                answered: false
            };
        }

        // Choisir une question aléatoire parmi les disponibles
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        const question = this.questions[randomIndex];

        // Marquer comme posée cette session
        this.currentSessionAsked.push(randomIndex);

        return {
            ...question,
            questionIndex: randomIndex,
            answered: false
        };
    }

    markAsCorrect(questionIndex) {
        if (!this.correctlyAnswered.includes(questionIndex)) {
            this.correctlyAnswered.push(questionIndex);
        }
    }

    isAllCorrect() {
        return this.correctlyAnswered.length >= this.questions.length;
    }

    getProgress() {
        return {
            correct: this.correctlyAnswered.length,
            total: this.questions.length || 10
        };
    }

    resetSession() {
        this.currentSessionAsked = [];
    }

    resetAll() {
        this.correctlyAnswered = [];
        this.currentSessionAsked = [];
    }

    reset() {
        this.resetSession();
    }
}
