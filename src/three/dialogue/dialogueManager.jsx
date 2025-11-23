export class DialogueManager {
    constructor() {
        this.questions = [];
        this.isLoaded = false;
        this.askedQuestions = [];
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

        // Si toutes les questions ont été posées
        if (this.askedQuestions.length >= this.questions.length) {
            return null;
        }

        // Trouver une question non posée
        let question;
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.questions.length);
            question = this.questions[randomIndex];
        } while (this.askedQuestions.includes(randomIndex));

        // Marquer cette question comme posée
        this.askedQuestions.push(randomIndex);

        return {
            ...question,
            answered: false
        };
    }

    reset() {
        this.askedQuestions = [];
    }
}
