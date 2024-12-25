import express from "express";
import assignmentRoutes from "./assignments/assignmentRoutes";

const router = express.Router();

router.use("/assignments", assignmentRoutes);

export default router;
