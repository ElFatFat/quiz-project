import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Admin = () => {
    return (
        <div className="admin">
            <Navbar />

        <h1>Admin</h1>
        <Link to="/admin/quiz">
            <button className="adminButton">Gestion des quiz</button>
        </Link>
        <Link to="/admin/themes">
            <button className="adminButton">Gestion des thèmes</button>
        </Link>
        <Link to="/home">
            <button className="adminButton">Retour à l'accueil</button>
        </Link>
        </div>
    );
};

export default Admin;