import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../assets/styles/profile.css";
import axios from "axios";
import { useEffect, useState } from "react";

const Profile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [user, setUser] = useState({});
    const [errors, setErrors] = useState({});

    const validateInput = () => {
        const newErrors = {};
        if (password && password.length > 0 && password.length < 6) {
            newErrors.password =
                "Le mot de passe doit contenir au moins 6 caractères";
        }
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email invalide";
        }

        if (password !== passwordConfirm) {
            newErrors.passwordConfirm =
                "Les mots de passe ne correspondent pas";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const sendUpdate = () => {
        if (!validateInput()) {
            return;
        }

        axios
            .put(
                "http://localhost:5001/users/",
                {
                    username: username,
                    email: email,
                    password: password,
                },
                {
                    headers: {
                        Authorization: `${localStorage.getItem("token")}`,
                    },
                }
            )
            .then((res) => {
                console.log(res);
                setUsername("");
                setEmail("");
                setPassword("");
                setPasswordConfirm("");
                window.location.reload();
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        axios
            .get("http://localhost:5001/users/me", {
                headers: {
                    Authorization: `${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setUser(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <div className="profile-container">
            <Navbar />
            <div className="profile-popup-container">
                <h1>Mon profil :</h1>
                <div className="profile-inputs-container">
                    <div className="profile-input-item">
                        <label htmlFor="username">Nom d'utilisateur :</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            placeholder={user.username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.email && (
                            <p className="error">{errors.email}</p>
                        )}
                    </div>
                    <div className="profile-input-item">
                        <label htmlFor="email">Adresse email :</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            placeholder={user.email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="profile-input-item">
                        <label htmlFor="password">Mot de passe :</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                            <p className="error">{errors.password}</p>
                        )}
                    </div>
                    <div className="profile-input-item">
                        <label htmlFor="password-confirm">
                            Confirmer le mot de passe :
                        </label>
                        <input
                            type="password"
                            id="password-confirm"
                            name="password-confirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                        {errors.passwordConfirm && (
                            <p className="error">{errors.passwordConfirm}</p>
                        )}
                    </div>
                    <button
                        className="profile-update-button"
                        onClick={sendUpdate}
                    >
                        Mettre à jour
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
