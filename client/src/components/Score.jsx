import React from "react";
import "../assets/styles/score.css";

const Score = ({ theme, date, score, maxScore, scoreID, username }) => {
    return (
        <div key={scoreID} className="score">
            <p className="scoreTitle">
                <strong>{theme}</strong> -{" "}
                {new Date(date).toLocaleDateString()}{" "}
                {new Date(date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </p>
            <p className="scoreContent">
                <strong>Score : </strong>
                {score}/{maxScore ?? "?"} (
                {(score / maxScore) * 100 || "0"}%)
            </p>
            {username && (
                <p className="scoreUsername">
                    <strong>Username: </strong>
                    {username}
                </p>
            )}
        </div>
    );
};

export default Score;
