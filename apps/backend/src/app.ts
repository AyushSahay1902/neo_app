import express from "express";
import cors from "cors";
import routes from "./modules/routes";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

export default app;
