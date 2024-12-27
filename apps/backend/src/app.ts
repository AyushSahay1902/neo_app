import express from "express";
import cors from "cors";
import routes from "./modules/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(express.urlencoded({ extended: true }));

export default app;
