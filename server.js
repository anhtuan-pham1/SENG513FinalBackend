import { connection } from "./connections/database.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json()).use(cors()).use(cookieParser());

app.get("/", (req, res) => {
  res.json({ msg: "Hello" });
});

// connection();

const port = process.env.port || 5000;
app.listen(port, () => {
  console.log("server is running at port", port);
});
