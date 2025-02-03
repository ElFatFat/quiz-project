import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Quiz from "../pages/Quiz";
import Result from "../pages/Result";
import LoginRegister from "../pages/LoginRegister";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginRegister />} />
                <Route path="/home" element={<Home />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/result" element={<Result />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;