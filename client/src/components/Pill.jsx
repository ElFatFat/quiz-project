import React from 'react';
import '../assets/styles/pill.css';

const Pill = ({ text, goodAnswer }) => {
    return (
        <div className={`pill ${goodAnswer ? 'good-answer' : ''}`}>
            {text}
        </div>
    );
};

export default Pill;