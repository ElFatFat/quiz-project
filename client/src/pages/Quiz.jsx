import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Quiz = () => {
    const quizNumber = 1;
    const quizList = ["Comment s'appelle le président actuel de la France ?", "Quelle est la capitale de la France ?", "Quelle est la couleur du cheval blanc d'Henri IV ?"];
    const [timeLeft, setTimeLeft] = useState(10);
    const [dashOffset, setDashOffset] = useState(0);

    useEffect(() => {
        const totalDuration = 10; // Durée totale du timer en secondes
        const radius = 45;
        const circumference = 2 * Math.PI * radius; // Circonférence du cercle
    
        setDashOffset(circumference); // Initialisation de dashOffset
    
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => {
                    const newTime = prevTime - 1;
                    setDashOffset((circumference * newTime) / totalDuration); // Calcul correct du dashOffset
                    return newTime;
                });
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [timeLeft]); // Ajout de `dashOffset` pourrait aussi aider si nécessaire
    

    return (
        <div className="quiz">
        <h1>Question {quizNumber}</h1>
        <h2>{quizList[1]}</h2>
        <div className="timerContainer">
            <div className="circle1"></div>
            <div className="circle2"></div>
            <div className="timerText">{timeLeft}</div>
        </div>
                <svg width="100" height="100" viewBox="0 0 100 100">
            {/* ClipPath pour masquer le carré en dehors du cercle */}
            <defs>
                <clipPath id="circleMask">
                    <circle cx="50" cy="50" r="45" />
                </clipPath>
            </defs>

            {/* Cercle de fond */}
            <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="3" fill="none" />

            {/* Carré animé, masqué à l'extérieur du cercle */}
            <rect x="25" y={position} width="50" height="50" fill="red" clipPath="url(#circleMask)" />
        </svg>
        <div className="answerContainer">
            <button className="answerButton">Réponse 1</button>
            <button className="answerButton">Réponse 2</button>
            <button className="answerButton">Réponse 3</button>
            <button className="answerButton">Réponse 4</button>
        </div>
        <Link to="/result">
            <button className="startButton">Voir les résultats</button>
        </Link>
        </div>
    );
};

export default Quiz;