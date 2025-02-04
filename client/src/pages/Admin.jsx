import { Link } from "react-router-dom";

const Admin = () => {
    return (
        <div className="admin">
        <h1>Admin</h1>
        <Link to="/admin/quiz">
            <button className="startButton">Gestion des quiz</button>
        </Link>
        <Link to="/admin/themes">
            <button className="startButton">Gestion des thèmes</button>
        </Link>
        <Link to="/home">
            <button className="startButton">Retour à l'accueil</button>
        </Link>
        </div>
    );
};

export default Admin;