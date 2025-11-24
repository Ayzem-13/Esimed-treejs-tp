import { useEffect, useState } from 'react';
import { useScene } from '../../context/SceneContext';

export function DialogueUI() {
    const { appInstance, setIsGameOver, setIsVictory, gameMode } = useScene();
    const [isVisible, setIsVisible] = useState(false);
    const [question, setQuestion] = useState('');
    const [answerA, setAnswerA] = useState('');
    const [answerB, setAnswerB] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [questionIndex, setQuestionIndex] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [dialogueShown, setDialogueShown] = useState(false);
    const [progressCorrect, setProgressCorrect] = useState(0);
    const [progressTotal, setProgressTotal] = useState(10);

    useEffect(() => {
        if (gameMode !== 'character') {
            setIsVisible(false);
            setDialogueShown(false);
            setQuestion('');
            setAnswerA('');
            setAnswerB('');
            setFeedback('');
            setSelectedAnswer(null);
        }
    }, [gameMode]);

    useEffect(() => {
        let frameId;
        const updateDialogue = () => {
            if (appInstance?.character) {
                const dialogue = appInstance.character.currentDialogue;

                if (dialogue && !dialogueShown) {
                    // Vérifier si c'est une victoire
                    if (dialogue.victory) {
                        appInstance.character.currentDialogue = null;
                        appInstance.character.resumeWaves();
                        setIsVisible(false);
                        setIsVictory(true);
                        return;
                    }

                    setIsVisible(true);
                    setDialogueShown(true);
                    setQuestion(dialogue.question);
                    setAnswerA(dialogue.answerA);
                    setAnswerB(dialogue.answerB);
                    setCorrectAnswer(dialogue.correctAnswer);
                    setQuestionIndex(dialogue.questionIndex);
                    setFeedback('');
                    setSelectedAnswer(null);
                } else if (!dialogue) {
                    if (dialogueShown) {
                        appInstance.character.resumeWaves();
                    }
                    setIsVisible(false);
                    setDialogueShown(false);
                    setFeedback('');
                }
            }
            frameId = requestAnimationFrame(updateDialogue);
        };

        frameId = requestAnimationFrame(updateDialogue);
        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [appInstance, dialogueShown, setIsVictory]);

    useEffect(() => {
        if (!appInstance?.character?.dialogueManager) return;

        const updateProgress = () => {
            const progress = appInstance.character.dialogueManager.getProgress();
            if (progress) {
                setProgressCorrect(progress.correct);
                setProgressTotal(progress.total);
            }
        };

        const intervalId = setInterval(updateProgress, 100);
        return () => clearInterval(intervalId);
    }, [appInstance]);

    const handleAnswer = (answer) => {
        setSelectedAnswer(answer);
        const isCorrect = answer === correctAnswer;

        if (isCorrect) {
            // Marquer la question comme correctement répondue
            appInstance.character.dialogueManager.markAsCorrect(questionIndex);
        } else {
            appInstance.character.wrongAnswerCount++;
        }

        setFeedback(isCorrect ? 'Correct!' : 'Mauvaise réponse!');

        // Vérifier le game over
        if (appInstance.character.wrongAnswerCount >= appInstance.character.maxWrongAnswers) {
            setTimeout(() => {
                setFeedback('Game Over! Trop d\'erreurs!');
                setTimeout(() => {
                    if (appInstance?.character?.currentDialogue) {
                        appInstance.character.currentDialogue = null;
                        appInstance.character.resumeWaves();
                    }
                    if (appInstance?.character?.dialogueManager) {
                        appInstance.character.dialogueManager.resetSession();
                    }
                    appInstance.character.wrongAnswerCount = 0;
                    setIsVisible(false);
                    setIsGameOver(true);
                }, 2000);
            }, 1500);
            return;
        }

        // Charger la question suivante après un délai
        setTimeout(() => {
            const nextQuestion = appInstance?.character?.dialogueManager?.getRandomQuestion();
            if (nextQuestion) {
                // Vérifier si c'est une victoire
                if (nextQuestion.victory) {
                    console.log('🎉 VICTOIRE détectée! Affichage du victory screen');
                    appInstance.character.currentDialogue = null;
                    appInstance.character.resumeWaves();
                    if (appInstance?.character?.dialogueManager) {
                        appInstance.character.dialogueManager.resetAll();
                    }
                    appInstance.character.wrongAnswerCount = 0;
                    setIsVisible(false);
                    setIsVictory(true);
                } else {
                    appInstance.character.currentDialogue = nextQuestion;
                    setDialogueShown(false);
                }
            } else {
                // Plus de questions disponibles cette session, fermer le dialogue
                setFeedback('Session terminee!');
                setTimeout(() => {
                    if (appInstance?.character?.currentDialogue) {
                        appInstance.character.currentDialogue = null;
                        appInstance.character.resumeWaves();
                    }
                    if (appInstance?.character?.dialogueManager) {
                        appInstance.character.dialogueManager.resetSession();
                    }
                    appInstance.character.wrongAnswerCount = 0;
                    setIsVisible(false);
                }, 2000);
            }
        }, 1500);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="mx-auto max-w-2xl p-4 pointer-events-auto mb-4">
                <div className="bg-white rounded-lg shadow-lg p-5 border-l-4 border-blue-500">
                    {/* Progression */}
                    <div className="mb-3 text-sm text-gray-500">
                        {progressCorrect}/{progressTotal}
                    </div>

                    {/* Question */}
                    <div className="mb-4">
                        <p className="text-gray-900 text-base font-semibold">
                            {question}
                        </p>
                    </div>

                    {/* Réponses */}
                    <div className="space-y-2">
                        <button
                            onClick={() => !feedback && handleAnswer('A')}
                            disabled={!!feedback}
                            className={`w-full text-left p-3 rounded border-l-4 transition-colors ${
                                selectedAnswer === 'A'
                                    ? feedback === 'Correct!'
                                        ? 'bg-green-100 border-green-500 text-green-900'
                                        : 'bg-red-100 border-red-500 text-red-900'
                                    : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                            } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span className="font-semibold">* {answerA}</span>
                        </button>
                        <button
                            onClick={() => !feedback && handleAnswer('B')}
                            disabled={!!feedback}
                            className={`w-full text-left p-3 rounded border-l-4 transition-colors ${
                                selectedAnswer === 'B'
                                    ? feedback === 'Correct!'
                                        ? 'bg-green-100 border-green-500 text-green-900'
                                        : 'bg-red-100 border-red-500 text-red-900'
                                    : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                            } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span className="font-semibold">* {answerB}</span>
                        </button>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div className={`mt-4 text-center font-bold ${
                            feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {feedback}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
