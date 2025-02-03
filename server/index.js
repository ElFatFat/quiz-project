let createError = require('http-errors');
let express = require('express');
let cookieParser = require('cookie-parser');
const cors = require("cors");
let path = require('path');
let logger = require('morgan');


let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

const { connectToDB } = require('./config/database');

const app = express();
const PORT = 5001;

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;

connectToDB();

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.listen(5001, () => {
  console.log('Server is running on http://localhost:5001');
});