import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended : true}));

import userRouter from './routes/user.routes.js';
import channelRouter from './routes/channel.routes.js';
import messageRouter from './routes/message.routes.js';

app.use('/api/users', userRouter)
app.use('/api/channels', channelRouter)
app.use('/api/messages', messageRouter)
// http://localhost:8000/api/users


export {app};