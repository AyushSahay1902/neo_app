import express from "express";
import assignmentRoutes from "./assignments/assignmentRoutes";
import templatesRoutes from "./templates/templatesRoutes";
import { templates, templatesRelations } from "../db/schema";

const router = express.Router();

router.use("/assignments", assignmentRoutes);
router.use("/templates", templatesRoutes);

export default router;
