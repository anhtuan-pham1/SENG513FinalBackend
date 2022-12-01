import connection from "./connections/database.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.js"
import userRoute from "./routes/user.js"
import postRoute from "./routes/post.js"
import commentRoute from "./routes/comment.js"

dotenv.config();

const app = express();
app.use(express.json()).use(cors()).use(cookieParser());

app.get("/", (req, res) => {
  res.json({ msg: "Hello" });
});

app.use("/api/", authRoute)
app.use("/api/", userRoute)
app.use("/api/", postRoute)
app.use("/api/", commentRoute)

connection();
const port = process.env.port || 4000;
app.listen(port, () => {
  console.log("server is running at port", port);
});
