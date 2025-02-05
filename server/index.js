let createError = require("http-errors");
const WebSocket = require("ws");
let express = require("express");
let cookieParser = require("cookie-parser");
const cors = require("cors");
let path = require("path");
let logger = require("morgan");
const Theme = require("./models/theme");
const Score = require("./models/score");
const User = require("./models/User");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const questionsRouter = require("./routes/questions");
const themesRouter = require("./routes/themes");
const scoresRouter = require("./routes/scores");

const { connectToDB } = require("./config/database");
const { title } = require("process");

const app = express();
const PORT = 5001;

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;
const TIME_LIMIT = process.env.TIME_LIMIT || 15000;

connectToDB();

const wss = new WebSocket.Server({ port: process.env.WSS_PORT || 5002 });

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/questions", questionsRouter);
app.use("/themes", themesRouter);
app.use("/scores", scoresRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

const rooms = {};

async function handleThemeSelection(room, themeTitle) {
    if (!rooms[room]) {
        console.error(`Room ${room} does not exist`);
        return;
    }

    rooms[room].theme = themeTitle;
    console.log(`Theme selected for room ${room}: ${themeTitle}`);

    try {
        const theme = await Theme.findOne({ title: themeTitle }).populate(
            "questions"
        );
        if (!theme) {
            //send the error to the admin
            rooms[room].admin.send(
                JSON.stringify({
                    type: "error",
                    message: `No theme found with title: ${themeTitle}`,
                })
            );
            return;
        }

        const fullListOfPossibleQuestions = theme.questions;
        console.log(
            `Questions for theme ${themeTitle}:`,
            fullListOfPossibleQuestions
        );

        //Send the informations to the clients
        rooms[room].clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        room,
                        type: "theme",
                        message: `The theme selected is ${themeTitle}`,
                    })
                );
            }
        });
        // You can now use fullListOfPossibleQuestions as needed
    } catch (error) {
        console.error(
            `Error fetching questions for theme ${themeTitle}:`,
            error
        );
    }
}

// Function to handle the quiz flow
async function handleQuizFlow(room) {
    if (!rooms[room]) {
        console.error(`Room ${room} does not exist`);
        return;
    }

    const questions = rooms[room].questions;
    const correctAnswers = questions.map((question) => question.correctAnswerIndex);

    console.log("Correct answers:", correctAnswers);
    for (let i = 0; i < questions.length; i++) {
        if (!rooms[room]) {
            break;
        }
        rooms[room].startTime = Date.now();
        const question = questions[i];
        rooms[room].currentQuestionIndex = i;

        
        // Send the current question to all clients
        let questionToSend = { "title": question.title, "possibleAnswers": question.possibleAnswers };
        rooms[room].clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({ room, type: "question", question: questionToSend })
                );
            }
        });

        // Wait for answers
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, TIME_LIMIT); // 1 minute time limit for example
        });

                // Send the correct answer to all clients
        rooms[room].clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ room, type: "stopQuestion"}));
            client.send(
              JSON.stringify({ room, type: "correctAnswer", correctAnswer: correctAnswers[i] })
            );
          }
        });

        // Wait for 5 seconds before sending the next question
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000); // 5 seconds delay
        });

        // Process answers
        console.log(`Processing answers for question ${i + 1}`);
        // Add your answer processing logic here
    }

    // End of quiz
    if (!rooms[room]) {
        return;
    }

    // Calculate scores
    const scores = {};

    for (const playerName in rooms[room].answers) {
        const playerAnswers = rooms[room].answers[playerName];
        console.log(`Answers for ${playerName}:`, playerAnswers);
        let score = 0;

        correctAnswers.forEach((correctAnswer, index) => {
            if (playerAnswers[index] == correctAnswers[index]) {
                score++;
            }
        });

        scores[playerName] = score;
    }
    // Send scores to each player
    rooms[room].clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const playerName = rooms[room].namesOfPlayers.find(
                (name) =>
                    client ===
                    rooms[room].clients[
                        rooms[room].namesOfPlayers.indexOf(name)
                    ]
            );
            const playerScore = scores[playerName];
            client.send(
                JSON.stringify({
                    room,
                    type: "end",
                    message: "Quiz has ended.",
                    score: {"playerScore": playerScore, "maxScore": correctAnswers.length},
                })
            );
        }
    });
    for (const playerName in scores) {
        try {
            const user = await User.findOne({ username: playerName });
            const theme = await Theme.findOne({ title: rooms[room].theme });
            console.log("User found:", user._id);

            if (user) {
                const score = new Score({
                    user: user._id,
                    theme: theme._id,
                    score: scores[playerName],
                    maxScore: correctAnswers.length,
                });
                await score.save();
                console.log(`Score saved for user ${playerName}`);
            } else {
                console.error(`User not found: ${playerName}`);
            }
        } catch (error) {
            console.error(`Error saving score for user ${playerName}:`, error);
        }
    }

    rooms[room].currentState = "waiting";
    console.log("Quiz has ended");
    console.log("Answers:", rooms[room].answers);
    console.log("Scores:", scores);
}

// WebSocket server setup
wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
        const parsedMessage = JSON.parse(message);
        const { type, room, data } = parsedMessage;
        console.log("Received message:", parsedMessage);
        console.log("Room:", room);
        console.log("Type:", type);
        console.log("Data:", data);

        switch (type) {
            case "join":
                if (!room) {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: "Room is required",
                        })
                    );
                    break;
                }

                if (!data) {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: "Player name is required",
                        })
                    );
                    break;
                }

                //If the user is already in a room, remove him from the room
                if (ws.room && rooms[ws.room]) {
                    rooms[ws.room].clients = rooms[ws.room].clients.filter(
                        (client) => client !== ws
                    );
                    rooms[ws.room].namesOfPlayers = rooms[
                        ws.room
                    ].namesOfPlayers.filter((name) => name !== data.playerName);
                    if (rooms[ws.room].clients.length === 0) {
                        delete rooms[ws.room];
                    } else if (ws.isAdmin) {
                        // Reassign admin if the current admin leaves
                        rooms[ws.room].admin = rooms[ws.room].clients[0];
                        rooms[ws.room].admin.isAdmin = true;
                        rooms[ws.room].admin.send(
                            JSON.stringify({
                                type: "admin",
                                message: "You are the new admin of this room.",
                            })
                        );
                        //Send list of themes to the new admin
                        try {
                            const themes = await Theme.find({ questions: { $exists: true, $not: { $size: 0 } } });
                            rooms[ws.room].admin.send(
                                JSON.stringify({ type: "themesList", themes })
                            );
                        } catch (error) {
                            rooms[ws.room].admin.send(
                                JSON.stringify({
                                    type: "error",
                                    message: "Failed to fetch themes",
                                })
                            );
                        }
                    }
                }

                if (!rooms[room]) {
                    rooms[room] = {
                        name: room,
                        currentState: "waiting",
                        namesOfPlayers: [],
                        clients: [],
                        admin: null,
                        theme: null, // Initialize theme property
                        answers: {}, // Initialize answers property
                        startTime: null, // Initialize start time property
                        questions: [], // Initialize questions property
                        currentQuestionIndex: 0, // Initialize current question index
                    };
                }
                rooms[room].clients.push(ws);
                rooms[room].namesOfPlayers.push(data);
                ws.room = room;

                ws.send(JSON.stringify({ type: "succesJoin", room }));
                if (!rooms[room].admin) {
                    rooms[room].admin = ws;
                    ws.isAdmin = true;
                    ws.send(
                        JSON.stringify({
                            type: "admin",
                            message: "You are the admin of this room.",
                        })
                    );
                    try {
                      const themes = await Theme.find({});
                      rooms[ws.room].admin.send(
                          JSON.stringify({ type: "themesList", themes })
                      );
                  } catch (error) {
                      rooms[ws.room].admin.send(
                          JSON.stringify({
                              type: "error",
                              message: "Failed to fetch themes",
                          })
                      );
                  }
                } else {
                    ws.isAdmin = false;
                }

                rooms[room].clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({
                                room,
                                type: "join",
                                message: `${data} joined the room`,
                            })
                        );
                    }
                });
                break;
            case "leave":
                if (rooms[room]) {
                    rooms[room].clients = rooms[room].clients.filter(
                        (client) => client !== ws
                    );
                    rooms[room].namesOfPlayers = rooms[
                        room
                    ].namesOfPlayers.filter((name) => name !== data.playerName);
                    if (rooms[room].clients.length === 0) {
                        delete rooms[room];
                    } else if (ws.isAdmin) {
                        // Reassign admin if the current admin leaves
                        rooms[room].admin = rooms[room].clients[0];
                        rooms[room].admin.isAdmin = true;
                        rooms[room].admin.send(
                            JSON.stringify({
                                type: "admin",
                                message: "You are the new admin of this room.",
                            })
                        );
                    }
                }
                console.log(`Client left room: ${room}`);
                break;
            case "message":
                if (rooms[room]) {
                    rooms[room].clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ room, data }));
                        }
                    });
                }
                break;
            case "startGame":
                if (
                    ws.isAdmin &&
                    rooms[room] &&
                    rooms[room].currentState === "waiting"
                ) {
                    rooms[room].currentState = "playing";
                    let questions = [];

                    try {
                        const theme = await Theme.findOne({
                            title: rooms[room].theme,
                        }).populate({
                            path: "questions",
                        });
                        if (!theme) {
                            console.error(
                                `No theme found with title: ${rooms[room].theme}`
                            );
                            return;
                        }

                        const fullListOfPossibleQuestions = theme.questions;
                        questions = fullListOfPossibleQuestions
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 10);
                        rooms[room].questions = questions;
                        console.log(
                            `Questions for theme ${rooms[room].theme}:`,
                            questions
                        );
                    } catch (error) {
                        console.error(
                            `Error fetching questions for theme ${rooms[room].theme}:`,
                            error
                        );
                        break;
                    }

                    handleQuizFlow(room);
                }
                break;

            case "getThemes":
                if (ws.isAdmin) {
                    try {
                        const themes = await Theme.find({});
                        ws.send(JSON.stringify({ type: "themesList", themes }));
                    } catch (error) {
                        ws.send(
                            JSON.stringify({
                                type: "error",
                                message: "Failed to fetch themes",
                            })
                        );
                    }
                }
                break;

            case "setTheme":
                if (ws.isAdmin) {
                    handleThemeSelection(room, data);
                }
                break;

            case "info":
                ws.send(
                    JSON.stringify({
                        type: "info",
                        message:
                            "Informations : " +
                            rooms[room].namesOfPlayers +
                            " Theme : " +
                            rooms[room].theme,
                    })
                );
                break;

            case "answer":
                if (rooms[room] && rooms[room].currentState === "playing") {
                    const elapsedTime = Date.now() - rooms[room].startTime;

                    if (elapsedTime > TIME_LIMIT) {
                        ws.send(
                            JSON.stringify({
                                type: "error",
                                message:
                                    "Time is up. You cannot change your answer.",
                            })
                        );
                    } else {
                        const playerName =
                            rooms[room].namesOfPlayers[
                                rooms[room].clients.indexOf(ws)
                            ];
                        const answer = data;
                        const questionIndex = rooms[room].currentQuestionIndex;
                        if (!rooms[room].answers[playerName]) {
                            rooms[room].answers[playerName] = {};
                        }
                        rooms[room].answers[playerName][questionIndex] = answer;
                        ws.send(
                            JSON.stringify({
                                type: "successAnswer",
                                message: "Answer registered.",
                            })
                        );
                    }
                }
                break;

            default:
                console.log("Unknown message type:", type);
        }
    });

    ws.on("close", () => {
        if (ws.room && rooms[ws.room]) {
            rooms[ws.room].clients = rooms[ws.room].clients.filter(
                (client) => client !== ws
            );
            if (rooms[ws.room].clients.length === 0) {
                delete rooms[ws.room];
            } else if (ws.isAdmin) {
                // Reassign admin if the current admin disconnects
                rooms[ws.room].admin = rooms[ws.room].clients[0];
                rooms[ws.room].admin.isAdmin = true;
                rooms[ws.room].admin.send(
                    JSON.stringify({
                        type: "admin",
                        message: "You are the new admin of this room.",
                    })
                );
            }
        }
        console.log("Client disconnected");
    });
});

app.listen(5001, () => {
    console.log("Server is running on http://localhost:5001");
    console.log("WebSocket server is running on ws://localhost:5002");
});
