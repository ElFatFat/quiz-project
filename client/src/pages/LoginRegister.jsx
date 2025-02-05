import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/loginRegister.css';

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
    };

    const validateInput = () => {
        const newErrors = {};
        if (!isLogin && !username) {
            newErrors.username = 'Pseudo est requis';
        }
        if (!email) {
            newErrors.email = 'Email est requis';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email est invalide';
        }
        if (!password) {
            newErrors.password = 'Mot de passe est requis';
        } else if (password.length < 4) {
            newErrors.password = 'Mot de passe doit contenir au moins 4 caractères';
        }
        if (!isLogin && password !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInput()) {
            return;
        }

        const endpoint = isLogin ? 'http://localhost:5001/users/login' : 'http://localhost:5001/users/register';
        const data = { username, email, password };

        console.log(data);
        console.log(endpoint);

        try {
            const response = await axios.post(endpoint, data);
            console.log(response.status);
            if (response.status === 200 || response.status === 201) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                console.log(localStorage.getItem('token'));
                console.log(response.data);
                window.location.href = '/home';
            }
        } catch (error) {
            isLogin ? alert('Mot de passe ou email incorrect') : alert('Email ou mot de passe déjà utilisé');
            console.error(error);
        }
    };

    return (
        <div className="loginRegister">
            <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div className="input-container">
                        <label htmlFor="username">Pseudo</label>
                        <input 
                            type="text" 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.username && <p className="error">{errors.username}</p>}
                    </div>
                )}
                <div className="input-container">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="text" 
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div className="input-container">
                    <label htmlFor="password">Mot de passe</label>
                    <input 
                        type="password" 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <p className="error">{errors.password}</p>}
                </div>
                {!isLogin && (
                    <div className="input-container">
                        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                    </div>
                )}
                <button type="submit">{isLogin ? 'Se connecter' : 'S\'inscrire'}</button>
            </form>
            <p onClick={toggleForm}>{isLogin ? 'Vous n\'avez pas de compte ? Inscrivez-vous' : 'Vous avez déjà un compte ? Connectez-vous'}</p>
        </div>
    );
};

export default LoginRegister;