import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const toggleForm = () => {
        setIsLogin(!isLogin);
        setUsername('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isLogin ? 'http://localhost:5001/users/login' : 'http://localhost:5001/users/register';
        const data = { username, email, password };

        // if (!isLogin && password !== confirmPassword) {
        //     alert("Les mots de passe ne correspondent pas");
        //     return;
        // }

        console.log(data);
        console.log(endpoint);

        try {
            const response = await axios.post(endpoint, data);
            console.log(response.status);
            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                console.log(localStorage.getItem('token'));
                console.log(response.data);
                window.location.href = '/home';
            }
            // redirect to the home page
        } catch (error) {
            isLogin? alert('Mot de passe ou email incorrect') : alert('Email ou mot de passe déjà utilisé');
            console.error(error);
        }
    };

    return (
        <div className="loginRegister">
            <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
            <form onSubmit={handleSubmit}> 
                {!isLogin && (
                    <input 
                    type="text" 
                    placeholder="Pseudo" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    />
                )}
                <input 
                    type="text" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Mot de passe" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {!isLogin && (
                    <input 
                        type="password" 
                        placeholder="Confirmer le mot de passe" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                )}
                <button type="submit">{isLogin ? 'Se connecter' : 'S\'inscrire'}</button>
            </form>
            <p onClick={toggleForm}>{isLogin ? 'Vous n\'avez pas de compte ? Inscrivez-vous' : 'Vous avez déjà un compte ? Connectez-vous'}</p>
        </div>
    );
};

export default LoginRegister;