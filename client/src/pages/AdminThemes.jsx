import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from 'axios';
import '../assets/styles/AdminTheme.css';

const token = localStorage.getItem('token');

const AdminThemes = () => {
    const [themes, setThemes] = useState([]);
    const [newTheme, setNewTheme] = useState({ title: '' });

    useEffect(() => {
        fetchThemes();
    }, []);
    
    async function fetchThemes() {
        try {
            const response = await axios.get('http://localhost:5001/themes/', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setThemes(response.data);
        } catch (error) {
            console.error('Error fetching themes:', error);
        }
    }

    const addTheme = async () => {
        try {
            const response = await axios.post('http://localhost:5001/themes/', newTheme, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Theme added:', response.data);
            setNewTheme({ title: '' });
            fetchThemes();
        } catch (error) {
            console.error('Error adding theme:', error);
        }
    };

    const deleteTheme = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5001/themes/${id}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Theme deleted:', response.data);
            fetchThemes();
        } catch (error) {
            console.error('Error deleting theme:', error);
        }
    };

    return (
        <>
        <Navbar />
        <div className="adminThemesContainer">
            <h1>Gestion des thèmes</h1>

            <div className="add-theme">
                <h2>Ajouter un thème</h2>
                <div className="add-theme-form">
                    <input
                        type="text"
                        placeholder="Titre du thème"
                        value={newTheme.title}
                        onChange={(e) => setNewTheme({ title: e.target.value })}
                    />
                    <button onClick={addTheme}>Ajouter</button>
                </div>
            </div>

            <div className="admin-themes">
                {themes.map((theme, index) => (
                    <div key={index} className="admin-theme">
                        <h3>{theme.title}</h3>
                        <button className="deleteButton" onClick={() => deleteTheme(theme._id)}>Supprimer</button>
                    </div>
                ))}
            </div>

            <Link to="/home">
                <button>Retour à l'accueil</button>
            </Link>
        </div>
        </>
    );
};

export default AdminThemes;