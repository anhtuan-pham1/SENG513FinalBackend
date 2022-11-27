import { mongoose } from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGODB_URL;

const connection = () => {
    mongoose.connect(
        URI,
        {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        (err) => {
            if (err) throw err;
            console.log("Connected to mongodb");
        }
    );
}

export { connection };