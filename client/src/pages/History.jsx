import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from 'axios';
import '../assets/styles/history.css';

const History = () => {

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [scores, setScores] = useState([]);

    if (!token) {
        console.error('No token found in local storage');
        navigate('/');
        return;
    }

    const retrieveScores = async () => {
        try {
            const response = await axios.get('http://localhost:5001/scores/user', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setScores(response.data);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }

    useEffect(() => {
        retrieveScores();
    }, []);
    return (
        <div className="main_container_history">
            <Navbar />

            <h1>Historique</h1>
            <div className="history">
                {scores.map((score) => (
                    <div key={score._id} className="score">
                        <p className="scoreTitle">
                            <strong>{score.theme.title}</strong> - {new Date(score.createdAt).toLocaleDateString()} {new Date(score.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="scoreContent">
                        <strong>Score : </strong>{score.score}/{score.maxScore ?? '?'} ({(score.score / score.maxScore)*100 || '0'}%)
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;