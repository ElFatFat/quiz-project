import { Link } from "react-router-dom";

const Quiz = () => {
    return (
        <div className="quiz">
        <h1>Quiz</h1>
        <Link to="/result">
            <button className="startButton">Voir les résultats</button>
        </Link>
        </div>
    );
};

export default Quiz;