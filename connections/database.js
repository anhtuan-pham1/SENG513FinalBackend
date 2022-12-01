import { mongoose } from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGODB_URL;

const connection = () => {
    mongoose.connect(
        URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
        (err) => {
            if (err) console.log(err);
            else console.log("Connected to mongodb");
        }
    );
}

export default connection;