import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import '../assets/styles/loginRegister.css';
import '../assets/styles/home.css';
import '../assets/styles/quiz.css';
import Home from "../pages/Home";
import Quiz from "../pages/Quiz";
import Result from "../pages/Result";
import LoginRegister from "../pages/LoginRegister";
import Admin from "../pages/Admin";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;