import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from "../components/Navbar";


const Home = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [themes, setThemes] = useState([]);
    const [questions, setQuestions] = useState([]);

    const getThemes = async () => {
        try {
            const response = await axios.get('http://localhost:5001/themes/');
            setThemes(response.data);
        } catch (error) {
            console.error('Error fetching themes:', error);
        }
    }

    const getQuestions = async () => {
        try {
            const response = await axios.get('http://localhost:5001/questions/');
            setQuestions(response.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }
    

    useEffect(() => {
        getThemes();
        getQuestions();
    }, []);

    const getRandomQuestion = () => {
        if (questions.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * questions.length);
        return questions[randomIndex].title;
    };

    return (
        <div className="home">
            <div className="background">
                {
                    Array.from(Array(15).keys()).map((index) => (
                        //Create a line that will directly has a style defined : the animation will be different for each line
                        <div 
                            key={index} 
                            className={`scrolling-line`} 
                            style={{ 
                                animationDuration: `${Math.random() * 5 + 5}s`, 
                                left: `${Math.random() * 100}vw`,
                            }}
                        >
                            {getRandomQuestion()}
                        </div>
                        )
                    )
                }
            

            </div>
            {/* <div className="overlay-gradient"></div> */}
            <Navbar />
            <h1>Bienvenue</h1>
            <Link to="/quiz">
                <button className="startButton">Commencer le quiz</button>
            </Link>
            <h2>Thèmes</h2>
            <div className="themes">
                {themes.map(theme => (
                    <Link to={`/score/${theme._id}`} key={theme._id}>
                        <div className="theme">
                            <h3>{theme.title}</h3>
                            <p>Nombre de questions: {theme.questions.length}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
