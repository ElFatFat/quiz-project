import { Link } from "react-router-dom";

import React, { useEffect, useState } from "react";


const Quiz = () => {

    const [type, setType] = useState('');
    const [room, setRoom] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);

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

    return (
        <div className="quiz">
            <h1>Quiz</h1>
            <Link to="/result">
                <button className="startButton">Voir les résultats</button>
            </Link>
            <div className="messages">
                <h2>Messages:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{JSON.stringify(msg)}</li>
                    ))}
                </ul>
            </div>
            <input type="text" placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} />
            <input type="text" placeholder="Room" value={room} onChange={(e) => setRoom(e.target.value)} />
            <input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button onClick={() => ws.send(JSON.stringify({ type: type, room: room, data: message }))}>Envoyer</button>
        </div>
    );
};

export default Quiz;