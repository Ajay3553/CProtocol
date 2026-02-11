import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended : true}));

import userRouter from './routes/user.routes.js';

app.use('/api/users', userRouter)
// http://localhost:8000/api/users


export {app};