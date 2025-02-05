import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Quiz from "../pages/Quiz";
import Result from "../pages/Result";
import LoginRegister from "../pages/LoginRegister";
import Admin from "../pages/Admin";
import AdminQuiz from "../pages/AdminQuiz";
import AdminThemes from "../pages/AdminThemes";
import Logout from "../pages/Logout";
import History from "../pages/History";
import ScoreTheme from "../pages/ScoreTheme";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginRegister />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/home" element={<Home />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
                <Route path="/history" element={<History />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/quiz" element={<AdminQuiz />} />
                <Route path="/admin/themes" element={<AdminThemes />} />
                <Route path="/score/:themeID" element={<ScoreTheme />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;