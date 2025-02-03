import { Link } from "react-router-dom";

const Home = () => {
    const checkAdminStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/users/isAdmin', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Admin status:', response.data);
        } catch (error) {
            console.error('Error during API request:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Error config:', error.config);
        }
    };
    return (
        <div className="home" onLoad={checkAdminStatus}>
        <h1>Bienvenue</h1>
        <Link to="/quiz">
            <button className="startButton">Commencer le quiz</button>
        </Link>
        <Link to="/admin">
            <button className="adminButton">Admin</button>
        </Link>
        </div>
    );
};

export default Home;
