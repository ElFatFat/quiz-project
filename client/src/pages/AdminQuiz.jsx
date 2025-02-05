import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../assets/styles/AdminQuiz.css";
import Navbar from "../components/Navbar";
import Pill from "../components/Pill";

const token = localStorage.getItem("token");

const AdminQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [themes, setThemes] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        title: "",
        possibleAnswers: [],
        correctAnswerIndex: 0,
        theme: "",
    });
    const [editQuestion, setEditQuestion] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const questionsResponse = await axios.get(
                    "http://localhost:5001/questions/",
                    {
                        headers: {
                            Authorization: `${token}`,
                        },
                    }
                );
                setQuestions(questionsResponse.data);

                const themesResponse = await axios.get(
                    "http://localhost:5001/themes/",
                    {
                        headers: {
                            Authorization: `${token}`,
                        },
                    }
                );
                setThemes(themesResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchData();
    }, []);

    const addQuestion = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5001/questions/",
                newQuestion,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            console.log("Question added:", response.data);
            setNewQuestion({
                title: "",
                possibleAnswers: [],
                correctAnswerIndex: 0,
                theme: "",
            });

            // Update the theme with the new question ID
            await axios.put(
                `http://localhost:5001/themes/${newQuestion.theme}/addQuestion`,
                { questionId: response.data._id },
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            fetchData();
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const updateQuestion = async (id) => {
        try {
            const response = await axios.put(
                `http://localhost:5001/questions/${id}`,
                editQuestion,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            console.log("Question updated:", response.data);
            setEditQuestion(null);
            fetchData();
        } catch (error) {
            console.error("Error updating question:", error);
        }
    };

    const deleteQuestion = async (id) => {
        try {
            const response = await axios.delete(
                `http://localhost:5001/questions/${id}`,
                {
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );
            console.log("Question deleted:", response.data);
            fetchData();
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    return (
        <div className="admin">
            <Navbar />
            <h1>Gestion des quiz</h1>
            {!editQuestion && (
                <div className="add-question">
                    <div>
                        <h2>Ajouter une question</h2>
                    </div>
                    <div className="inputs">
                        <div className="input-container">
                            <label htmlFor="title">Titre de la question</label>
                            <input
                                type="text"
                                value={newQuestion.title}
                                onChange={(e) =>
                                    setNewQuestion({
                                        ...newQuestion,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="possibleAnswers">
                                Réponses possibles
                            </label>
                            <textarea
                                placeholder="Oui;Non;Test;Beaucoup"
                                value={newQuestion.possibleAnswers.join(";")}
                                onChange={(e) =>
                                    setNewQuestion({
                                        ...newQuestion,
                                        possibleAnswers:
                                            e.target.value.split(";"),
                                    })
                                }
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="correctAnswerIndex">
                                Index de la réponse correcte
                            </label>
                            <input
                                type="number"
                                placeholder="0 - 3"
                                value={newQuestion.correctAnswerIndex}
                                onChange={(e) =>
                                    setNewQuestion({
                                        ...newQuestion,
                                        correctAnswerIndex: parseInt(
                                            e.target.value
                                        ),
                                    })
                                }
                                max="3"
                                min="0"
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="theme">Thème</label>
                            <select
                                value={newQuestion.theme}
                                onChange={(e) =>
                                    setNewQuestion({
                                        ...newQuestion,
                                        theme: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner un thème</option>
                                {themes.map((theme) => (
                                    <option key={theme._id} value={theme._id}>
                                        {theme.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <button onClick={addQuestion}>Ajouter</button>
                    </div>
                </div>
            )}

            <div className="questionsAdminContainer">
                {questions.map((question, index) => (
                    <div key={index} className="questionAdminContainer">
                        <div className="themeHeader">
                            {question.theme?.title || "Aucun thème attribué"}
                        </div>
                        <div className="questionAdminContainerInformations">
                            <div>
                                <h3>{question.title}</h3>
                                <div className="pillContainer">
                                    {question.possibleAnswers.map(
                                        (answer, index) => (
                                            <Pill
                                                key={index}
                                                text={answer}
                                                goodAnswer={
                                                    index ===
                                                    question.correctAnswerIndex
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                            <div className="questionAdminContainerButtons">
                                <button
                                    onClick={() => setEditQuestion(question)}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="deleteButton"
                                    onClick={() => deleteQuestion(question._id)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {editQuestion && (
                <div className="edit-question">
                    <div>
                        <h2>Question à modifier</h2>
                    </div>
                    <div className="inputs">
                        <div className="input-container">
                            <label htmlFor="title">Titre de la question</label>
                            <input
                                type="text"
                                value={editQuestion.title}
                                onChange={(e) =>
                                    setEditQuestion({
                                        ...editQuestion,
                                        title: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="input-container">
                            <label htmlFor="possibleAnswers">
                                Réponses possibles
                            </label>
                            <textarea
                                placeholder="Oui;Non;Test;Beaucoup"
                                value={editQuestion.possibleAnswers.join(";")}
                                onChange={(e) =>
                                    setEditQuestion({
                                        ...editQuestion,
                                        possibleAnswers:
                                            e.target.value.split(";"),
                                    })
                                }
                            />
                        </div>

                        <div className="input-container">
                            <label htmlFor="correctAnswerIndex">
                                Index de la réponse correcte
                            </label>
                            <input
                                type="number"
                                value={editQuestion.correctAnswerIndex}
                                onChange={(e) =>
                                    setEditQuestion({
                                        ...editQuestion,
                                        correctAnswerIndex: parseInt(
                                            e.target.value
                                        ),
                                    })
                                }
                            />
                        </div>
                        <div className="input-container">
                            <label htmlFor="theme">Thème</label>
                            <select
                                value={editQuestion.theme}
                                onChange={(e) =>
                                    setEditQuestion({
                                        ...editQuestion,
                                        theme: e.target.value,
                                    })
                                }
                            >
                                <option value="">Sélectionner un thème</option>
                                {themes.map((theme) => (
                                    <option key={theme._id} value={theme._id}>
                                        {theme.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="button-edit-container">
                        <button
                            onClick={() => updateQuestion(editQuestion._id)}
                            className="updateButton"
                        >
                            Mettre à jour
                        </button>
                        <button
                            onClick={() => setEditQuestion(null)}
                            className="cancelButton"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuiz;
