import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from 'axios';
import '../assets/styles/history.css';
import Score from "../components/Score";

const ScoreTheme = () => {
    const navigate = useNavigate();
    const { themeID } = useParams(); // Get the theme ID from the URL
    const token = localStorage.getItem('token');

    const [scores, setScores] = useState([]);

    if (!token) {
        console.error('No token found in local storage');
        navigate('/');
        return;
    }

    const retrieveScores = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/scores/${themeID}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setScores(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }

    useEffect(() => {
        retrieveScores();
    }, [themeID]);

    return (
        <div className="main_container_history">
            <Navbar />
            <h1>Scores for Theme: {themeID}</h1>
            <div className="history">
                {scores.map((score,  index) => (
                    <Score key={index} theme={score.theme.title} score={score.score} maxScore={score.maxScore} date={score.createdAt} _id={score._id} username={score.user.username} />
                ))}
            </div>
        </div>
    );
};

export default ScoreTheme;