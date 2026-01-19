import dotenv from 'dotenv';
import connectDB from './db/connectDB.js'
import {app} from './app.js'

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    const porting = process.env.PORT || 7000;
    app.listen(porting, ()=> {
        console.log(`Server is running on PORT : ${porting}`);
    })
})
.catch((e) => {
    console.log("MONGODB connection Failed!! :", e);
})