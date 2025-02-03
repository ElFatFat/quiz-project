import { Link } from "react-router-dom";

const Result = () => {
    return (
        <div className="result">
        <h1>Résultats</h1>
        <Link to="/">
            <button className="startButton">Retour à l'accueil</button>
        </Link>
        </div>
    );
};

export default Result;