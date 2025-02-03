import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="home">
        <h1>Bienvenue</h1>
        <Link to="/quiz">
            <button className="startButton">Commencer le quiz</button>
        </Link>
        </div>
    );
};

export default Home;
