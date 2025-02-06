import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import '../assets/styles/quiz.css';
import axios from "axios";
import Navbar from "../components/Navbar";

const Quiz = () => {

    const [type, setType] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [clickedButton, setClickedButton] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState('En attente de sélection...');
    const [themes, setThemes] = useState([]);
    const [selectedValue, setSelectedValue] = useState('default');
    const [isThemeSelected, setIsThemeSelected] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const timerRef = useRef(null);
    const [username, setUsername] = useState('');
    const [isQuestionStopped, setIsQuestionStopped] = useState(false);
    const [score, setScore] = useState(0);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [scoreboard, setScoreboard] = useState([]);
    const [isSolo, setIsSolo] = useState(true);
    const [nextQuestionTimer, setNextQuestionTimer] = useState(5);

    const generateRoomName = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    useEffect(() => {
        const roomName = generateRoomName();
        setRoom(roomName);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(room).then(() => {
            alert('Nom du salon copié dans le presse-papiers');
        }).catch(err => {
            console.error('Erreur lors de la copie dans le presse-papiers:', err);
        });
    };

    useEffect(() => {
        // Establish WebSocket connection

        getUserInformation();
        
        const socket = new WebSocket('ws://localhost:5002');

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            // Join a room (example)
        };

        socket.onmessage = (event) => {
            //ici que tu recevras des messages
            const message = JSON.parse(event.data);

            if (message.type === 'succesJoin') {
                setIsConnected(true);
                console.log('Connected:', message.type);
            }

            if (message.type === 'admin') {
                setIsAdmin(true);
                console.log('Admin:', message.type);
            }

            if (message.type === 'question') {
                console.log(message.question.title);
                setGameStarted(true);
                setCurrentQuestion(message.question.title);
                setAnswers(message.question.possibleAnswers);
                console.log(message.question.possibleAnswers);
                setClickedButton(null);
                setCorrectAnswer(null);
                setTimeLeft(15); // Reset timer
                if (!timerRef.current) {
                    startTimer();
                }
                setIsQuestionStopped(false);
            }

            if (message.type === 'correctAnswer') {
                console.log('Correct answer:', message.correctAnswer);
                setCorrectAnswer(message.correctAnswer);
                setNextQuestionTimer(5);
            }

            if (message.type === 'stopQuestion') {
                setIsQuestionStopped(true);
            }

            if (message.score) {
                console.log('Score:', message.score);
                setScore(message.score);
                setIsGameFinished(true);
            }

            if (message.type === 'end') {
                console.log('End of game');
                setIsGameFinished(true);
            }

            if (message.type === 'themesList') {
                console.log('Themes:', message.themes);
                setThemes(message.themes);
            }

            if (message.type === 'theme') {
                setCurrentTheme(message.message);
            }

            if (message.type === 'scoreboard') {
                console.log('Scoreboard:', message.scoreboard);
                const scoresArray = Object.entries(message.scores);
                setScoreboard(scoresArray);
                if (scoresArray.length === 1) {
                    setIsSolo(true);
                } else {
                    setIsSolo(false);
                }
            }

            console.log('Received message:', message);
            setMessages(prevMessages => [...prevMessages, message]);
        };

        socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        setWs(socket);

        // Cleanup on component unmount
        return () => {
            socket.close();
            if (timerRef.current) {
                cancelAnimationFrame(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (correctAnswer !== null) {
            const interval = setInterval(() => {
                setNextQuestionTimer(prev => {
                    if (prev > 0) {
                        return prev - 1;
                    } else {
                        clearInterval(interval);
                        return 0;
                    }
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [correctAnswer]);

    const getUserInformation = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/users/me', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setUsername(response.data.username);
        } catch (error) {
            if(error.status === 401) {
                console.error('You are not connected');
                navigate('/'); // Redirect to login page

            }
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Error config:', error.config);
        }
    };

    const startTimer = () => {
        const startTime = Date.now();
        const duration = 15000; // 15 seconds in milliseconds
    
        const updateTimer = () => {
            const elapsedTime = Date.now() - startTime;
            const timeLeft = Math.max(duration - elapsedTime, 0);
            setTimeLeft(Math.ceil(timeLeft / 1000));
    
            if (timeLeft > 0) {
                timerRef.current = requestAnimationFrame(updateTimer);
            } else {
                timerRef.current = null;
            }
        };
    
        timerRef.current = requestAnimationFrame(updateTimer);
    };

    const handleSelectChange = (e) => {
        const selectedTheme = e.target.value;
        setSelectedValue(selectedTheme); 
        setMessage(selectedTheme);
        console.log('Selected theme:', selectedTheme); 
    };

    const handleSelectTheme = () => {
        ws.send(JSON.stringify({ type: "setTheme", room: room, data: message }));
        setIsThemeSelected(true);
    }

    return (
        <div className="quiz">
            <Navbar />
            <div className="questionContainer">
                <h2>{currentQuestion}</h2>
            </div>
            {
                gameStarted && (
                    <div className="answers">
                        <div className="timer">
                            <svg width="100" height="100">
                                <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="3" fill="none" />
                                <circle cx="50" cy="50" r="45" stroke="#646cff" strokeWidth="3" fill="none"
                                    strokeDasharray={Math.PI * 2 * 45}
                                    strokeDashoffset={(1 - timeLeft / 15) * Math.PI * 2 * 45}
                                    style={{ 
                                        transition: 'stroke-dashoffset 1s linear',
                                        transform: 'rotate(-90deg)',
                                        transformOrigin: '50% 50%'
                                    }}
                                />
                            </svg>
                            <div className="timer-text">{timeLeft}s</div>
                        </div>
                        <h2>Réponses:</h2>
                        <ul>
                            {answers.map((element, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => {
                                            ws.send(JSON.stringify({ type: "answer", room: room, data: index }));
                                            setClickedButton(index); 
                                        }}
                                        style={{ 
                                            backgroundColor: correctAnswer === index ? 'lightgreen' : (clickedButton === index ? (correctAnswer !== null && clickedButton !== correctAnswer ? 'red' : '#878dff') : 'white') 
                                        }}
                                        disabled={isQuestionStopped}
                                    >
                                        {element}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        { correctAnswer !== null && (
                            <h2>Question suivante dans {nextQuestionTimer} secondes</h2>
                        )    
                        }  
                        {isGameFinished && (
                        <>
                            <div className="overlay"></div>
                            <div className="scoreContainer">
                                <h1>Fin de la partie</h1>   
                                <div className="scoreWrapper">
                                    <div className="soloScore">
                                        <h2>Score personnel :</h2>
                                        <h2>Score: {score.playerScore}/{score.maxScore}</h2>
                                    </div>
                                    {!isSolo && (
                                        <>
                                        <div className="lineSeparator"></div>
                                        <div className="multiScore">
                                        <h2>Score des joueurs :</h2>
                                        <ul>
                                            {scoreboard
                                                .sort((a, b) => b[1] - a[1])
                                                .map(([player, playerScore], index) => (
                                                    <li key={index}>
                                                        {index + 1}. {player}: {playerScore}
                                                    </li>
                                            ))}
                                        </ul>
                                        </div>
                                        </>
                                    )}
                                </div>
                                <Link to="/home">Retour à l'accueil</Link>
                            </div>
                        </>
                        )}
                    </div>
                )
            }
            {
            isConnected && !gameStarted && (
                <div className={`themeContainer`}>
                    <div className="themeChosenContainer">
                        <h2>{currentTheme !== 'En attente de sélection...' ? `Thème choisi: ${currentTheme}` : currentTheme}</h2>
                    </div>
                    {isAdmin && (
                        <div className="themeSelectorContainer">
                            <select defaultValue={"default"} onChange={handleSelectChange} >
                                <option disabled value="default">Choisissez un thème</option>
                                {themes.map((theme, index) => (
                                    <option key={index} value={theme.title}>{theme.title}</option>
                                ))}
                            </select>
                            <button onClick={handleSelectTheme} disabled={selectedValue === 'default'}>Choisir le thème</button>
                            <button className="startGameButton" onClick={() => ws.send(JSON.stringify({ type: "startGame", room: room }))} disabled={!isThemeSelected}>Lancer la partie</button>
                        </div>
                    )}
                </div>
                )
            }
            {!isConnected && (
                <div className="joinContainer">
                    <div className="roomContainer">
                        <input type="text" placeholder={room} value={room} onChange={(e) => setRoom(e.target.value)} />
                        <button onClick={copyToClipboard}>Copier</button>
                    </div>
                    <button onClick={() => ws.send(JSON.stringify({ type: "join", room: room, data: username }))}>Rejoindre la partie</button> 
                </div>
            )}
            {/* <div className="messages">
                <h2>Messages:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{JSON.stringify(msg)}</li>
                    ))}
                </ul>
            </div> */}
        </div>
    );
};

export default Quiz;