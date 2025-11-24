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
            <div className="mx-auto max-w-2xl p-6 pointer-events-auto mb-6">
                <div 
                    className="rounded-xl p-6"
                    style={{
                        background: '#242424',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {/* Header avec progression */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-2 h-2 rounded-full"
                                style={{ background: '#1a77cb' }}
                            />
                            <span className="text-sm font-medium text-white/70">Question</span>
                        </div>
                        <div 
                            className="px-3 py-1 rounded-md text-xs font-medium"
                            style={{
                                background: 'rgba(26, 119, 203, 0.15)',
                                border: '1px solid rgba(26, 119, 203, 0.3)',
                                color: '#1a77cb'
                            }}
                        >
                            {progressCorrect}/{progressTotal}
                        </div>
                    </div>

                    {/* Question */}
                    <div className="mb-6">
                        <p className="text-white text-lg font-medium leading-relaxed">
                            {question}
                        </p>
                    </div>

                    {/* Réponses */}
                    <div className="space-y-3">
                        <button
                            onClick={() => !feedback && handleAnswer('A')}
                            disabled={!!feedback}
                            className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                            style={{
                                background: selectedAnswer === 'A'
                                    ? feedback === 'Correct!'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: selectedAnswer === 'A'
                                    ? feedback === 'Correct!'
                                        ? '1px solid rgba(34, 197, 94, 0.3)'
                                        : '1px solid rgba(239, 68, 68, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: feedback ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (!feedback) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!feedback && selectedAnswer !== 'A') {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                        >
                            <span 
                                className="font-medium"
                                style={{
                                    color: selectedAnswer === 'A'
                                        ? feedback === 'Correct!'
                                            ? '#22c55e'
                                            : '#ef4444'
                                        : '#ffffff'
                                }}
                            >
                                A. {answerA}
                            </span>
                        </button>

                        <button
                            onClick={() => !feedback && handleAnswer('B')}
                            disabled={!!feedback}
                            className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                            style={{
                                background: selectedAnswer === 'B'
                                    ? feedback === 'Correct!'
                                        ? 'rgba(34, 197, 94, 0.15)'
                                        : 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: selectedAnswer === 'B'
                                    ? feedback === 'Correct!'
                                        ? '1px solid rgba(34, 197, 94, 0.3)'
                                        : '1px solid rgba(239, 68, 68, 0.3)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                cursor: feedback ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (!feedback) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!feedback && selectedAnswer !== 'B') {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                        >
                            <span 
                                className="font-medium"
                                style={{
                                    color: selectedAnswer === 'B'
                                        ? feedback === 'Correct!'
                                            ? '#22c55e'
                                            : '#ef4444'
                                        : '#ffffff'
                                }}
                            >
                                B. {answerB}
                            </span>
                        </button>
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div 
                            className="mt-4 text-center font-medium py-2 px-4 rounded-lg"
                            style={{
                                background: feedback === 'Correct!' 
                                    ? 'rgba(34, 197, 94, 0.15)' 
                                    : 'rgba(239, 68, 68, 0.15)',
                                border: feedback === 'Correct!'
                                    ? '1px solid rgba(34, 197, 94, 0.3)'
                                    : '1px solid rgba(239, 68, 68, 0.3)',
                                color: feedback === 'Correct!' ? '#22c55e' : '#ef4444'
                            }}
                        >
                            {feedback}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
