import { Link } from "react-router-dom";

const Admin = () => {
    return (
        <div className="admin">
        <h1>Admin</h1>
        <Link to="/home">
            <button className="startButton">Retour à l'accueil</button>
        </Link>
        </div>
    );
};

export default Admin;