import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(false);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="loginRegister">
            <h1>{isLogin ? 'Connexion' : 'Inscription'}</h1>
            <form>
                <input type="text" placeholder="Nom d'utilisateur" />
                <input type="password" placeholder="Mot de passe" />
                {!isLogin && <input type="password" placeholder="Confirmer le mot de passe" />}
                <Link to={isLogin ? '/home' : '/'}>
                    <button>{isLogin ? 'Se connecter' : 'S\'inscrire'}</button>
                </Link>
            </form>
            <button onClick={toggleForm}>{isLogin ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}</button>
        </div>
    );
};

export default LoginRegister;