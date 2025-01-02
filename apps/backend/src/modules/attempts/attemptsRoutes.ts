import express from "express";
import type { Request, Response } from "express";
import minioClient from "../../utils/minioClient";

const router = express.Router();

router.get("/attempts", async (req: Request, res: Response) => {
  //
  res.send({ message: "All Attempt" });
});

router.post("createAttempt", async (req: Request, res: Response) => {
  //
  res.send({ message: "Attempt created" });
});

export default router;
