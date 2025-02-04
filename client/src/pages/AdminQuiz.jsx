import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const token = localStorage.getItem('token');

const AdminQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [themes, setThemes] = useState([]);
    const [newQuestion, setNewQuestion] = useState({ title: '', possibleAnswers: [], correctAnswerIndex: 0, theme: '' });
    const [editQuestion, setEditQuestion] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const questionsResponse = await axios.get('http://localhost:5001/questions/', {
                    headers: {
                        'Authorization': `${token}`
                    }
                });
                setQuestions(questionsResponse.data);

                const themesResponse = await axios.get('http://localhost:5001/themes/', {
                    headers: {
                        'Authorization': `${token}`
                    }
                });
                setThemes(themesResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    const addQuestion = async () => {
        try {
            const response = await axios.post('http://localhost:5001/questions/', newQuestion, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Question added:', response.data);
            setNewQuestion({ title: '', possibleAnswers: [], correctAnswerIndex: 0, theme: '' });

            // Update the theme with the new question ID
            await axios.put(`http://localhost:5001/themes/${newQuestion.theme}/addQuestion`, { questionId: response.data._id }, {
                headers: {
                    'Authorization': `${token}`
                }
            });

            fetchData();
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const updateQuestion = async (id) => {
        try {
            const response = await axios.put(`http://localhost:5001/questions/${id}`, editQuestion, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Question updated:', response.data);
            setEditQuestion(null);
            fetchData();
        } catch (error) {
            console.error('Error updating question:', error);
        }
    };

    const deleteQuestion = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5001/questions/${id}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Question deleted:', response.data);
            fetchData();
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    return (
        <div className="admin">
            <h1>Gestion des quiz</h1>

            <div className="add-question">
                <h2>Ajouter une question</h2>
                <input
                    type="text"
                    placeholder="Titre de la question"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                />
                <textarea
                    placeholder="Réponses possibles (séparées par un ;)"
                    value={newQuestion.possibleAnswers.join(';')}
                    onChange={(e) => setNewQuestion({ ...newQuestion, possibleAnswers: e.target.value.split(';') })}
                />
                <input
                    type="number"
                    placeholder="Index de la réponse correcte"
                    value={newQuestion.correctAnswerIndex}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswerIndex: parseInt(e.target.value) })}
                />
                <select
                    value={newQuestion.theme}
                    onChange={(e) => setNewQuestion({ ...newQuestion, theme: e.target.value })}
                >
                    <option value="">Sélectionner un thème</option>
                    {themes.map((theme) => (
                        <option key={theme._id} value={theme._id}>{theme.title}</option>
                    ))}
                </select>
                <button onClick={addQuestion}>Ajouter</button>
            </div>

            <div className="questions">
                {questions.map((question, index) => (
                    <div key={index} className="question">
                        <h3>{question.title}</h3>
                        <p>{question.possibleAnswers.join(', ')}</p>
                        <p>{question.theme?.title || "Aucun thème attribué"}</p>
                        <button onClick={() => setEditQuestion(question)}>Modifier</button>
                        <button className="deleteButton" onClick={() => deleteQuestion(question._id)}>Supprimer</button>
                    </div>
                ))}
            </div>

            {editQuestion && (
                <div className="edit-question">
                    <h2>Modifier la question</h2>
                    <input
                        type="text"
                        placeholder="Titre de la question"
                        value={editQuestion.title}
                        onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })}
                    />
                    <textarea
                        placeholder="Réponses possibles (séparées par des virgules)"
                        value={editQuestion.possibleAnswers.join(', ')}
                        onChange={(e) => setEditQuestion({ ...editQuestion, possibleAnswers: e.target.value.split(', ') })}
                    />
                    <input
                        type="number"
                        placeholder="Index de la réponse correcte"
                        value={editQuestion.correctAnswerIndex}
                        onChange={(e) => setEditQuestion({ ...editQuestion, correctAnswerIndex: parseInt(e.target.value) })}
                    />
                    <button onClick={() => updateQuestion(editQuestion._id)}>Mettre à jour</button>
                    <button onClick={() => setEditQuestion(null)}>Annuler</button>
                </div>
            )}

            <Link to="/home">
                <button className="startButton">Retour à l'accueil</button>
            </Link>
        </div>
    );
};

export default AdminQuiz;