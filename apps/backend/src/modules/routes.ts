import express from "express";
import assignmentRoutes from "./assignments/assignmentRoutes";
import templatesRoutes from "./templates/templatesRoutes";
import attemptsRoutes from "./attempts/attemptsRoutes";
import { templates, templatesRelations } from "../db/schema";

const router = express.Router();

router.use("/assignments", assignmentRoutes);
router.use("/templates", templatesRoutes);
router.use("/attempts", attemptsRoutes);

export default router;
