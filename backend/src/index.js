import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import { app } from './app.js';
import http from 'http';
import { initSocket } from './socket/socket.js';

dotenv.config({
    path: './env'
});

connectDB()
    .then(() => {
        const port = process.env.PORT || 7000;
        const server = http.createServer(app);
        const io = initSocket(server);
        app.set("io", io);

        server.listen(port, () => {
            console.log(`Server is running on PORT: ${port}`);
        });
    })
    .catch((e) => {
        console.log("MONGODB connection Failed!!:", e);
    });