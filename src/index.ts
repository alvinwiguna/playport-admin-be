import express, {Express, Request, Response} from "express";
import dotenv from "dotenv";
import cors from "cors";

import auth from "./auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

app.use(auth);

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to PlayPort Admin");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});