import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import '../assets/styles/quiz.css';
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
    const [theme, setTheme] = useState('Pas de thème choisi');
    const [selectedValue, setSelectedValue] = useState('default');
    const [isThemeSelected, setIsThemeSelected] = useState(false);

    useEffect(() => {
        // Establish WebSocket connection
        const socket = new WebSocket('ws://localhost:5002');

        socket.onopen = () => {
            console.log('Connected to WebSocket server');
            // Join a room (example)
        };

        socket.onmessage = (event) => {
            //ici que tu recevras des messages
            const message = JSON.parse(event.data);

            if (message.type === 'admin' || message.type === 'succesJoin') {
                setIsConnected(true);
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
            }

            if (message.type === 'correctAnswer') {
                console.log('Correct answer:', message.correctAnswer);
                setCorrectAnswer(message.correctAnswer);
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
        };
    }, []);

    const handleSelectChange = (e) => {
        const selectedTheme = e.target.value;
        setSelectedValue(selectedTheme); // Mettre à jour la valeur sélectionnée
        setMessage(selectedTheme);
        setTheme(selectedTheme);
        console.log('Selected theme:', selectedTheme); // Log pour vérifier la valeur sélectionnée
    };

    const handleSelectTheme = () => {
        ws.send(JSON.stringify({ type: "setTheme", room: room, data: message }));
        setIsThemeSelected(true);
    }

    return (
        <div className="quiz">
            <Navbar />
            <h1>Quiz</h1>
            <div>
                <h2>{currentQuestion}</h2>
            </div>
            {
                gameStarted && (
                    <div className="answers">
                <h2>Réponses:</h2>
                <ul>
                {answers.map((element, index) => (
                    <li
                    key={index}
                    onClick={() => {
                        ws.send(JSON.stringify({ type: "answer", room: room, data: index }));
                        setClickedButton(index); 
                    }}
                    style={{ 
                        backgroundColor: correctAnswer === index ? 'lightgreen' : (clickedButton === index ? (correctAnswer !== null && clickedButton !== correctAnswer ? 'red' : 'lightblue') : 'white') 
                    }}
                    >
                    {element}
                </li>                ))}
                </ul>
            </div>
                )
            }
            {
            isConnected && isAdmin && !gameStarted && (
                <div className={`themeContainer`}>
                    <div className="themeChosenContainer">
                        <h2>Thème choisi: {theme}</h2>
                    </div>
                    <div className="themeSelectorContainer">
                        <select defaultValue={"default"} onChange={handleSelectChange} >
                            <option disabled value="default">Choisissez un thème</option>
                            <option value="Histoire">Histoire</option>
                        </select>
                        <button onClick={handleSelectTheme} disabled={selectedValue === 'default'}>Choisir le thème</button>
                        <button className="startButton" onClick={() => ws.send(JSON.stringify({ type: "startGame", room: room }))} disabled={!isThemeSelected}>Lancer la partie</button>
                    </div>
                </div>
                )
            }
            {!isConnected && (
                <div className="joinContainer">
                    {/* <input type="text" placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} /> */}
                    <input type="text" placeholder="Nom du salon" value={room} onChange={(e) => setRoom(e.target.value)} />
                    <input type="text" placeholder="Pseudo" value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button onClick={() => ws.send(JSON.stringify({ type: "join", room: room, data: message }))}>Rejoindre la partie</button> 
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