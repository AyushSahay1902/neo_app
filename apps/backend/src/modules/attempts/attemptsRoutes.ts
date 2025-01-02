import express from "express";
import type { Request, Response, Router } from "express";
import minioClient from "../../utils/minioClient";
import db from "../../db/index";
import { assignments, assignmentAttempts } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const router: Router = express.Router();
const bucketName = "attempts";

// Helper function to get attempt by ID
const getAttemptById = async (id: number) => {
  const [attempt] = await db
    .select({
      id: assignmentAttempts.id,
      assignmentId: assignmentAttempts.assignmentId,
      status: assignmentAttempts.status,
      submittedAt: assignmentAttempts.updatedAt,
      bucketUrl: assignmentAttempts.bucketUrl,
      createdAt: assignmentAttempts.createdAt,
      updatedAt: assignmentAttempts.updatedAt,
    })
    .from(assignmentAttempts)
    .where(eq(assignmentAttempts.id, id))
    .execute();
  return attempt;
};

// Route to list all attempts
router.get("/listAttempts", async (req: Request, res: Response) => {
  try {
    const allAttempts = await db
      .select({
        id: assignmentAttempts.id,
        assignmentId: assignmentAttempts.assignmentId,
        status: assignmentAttempts.status,
        submittedAt: assignmentAttempts.updatedAt,
        bucketUrl: assignmentAttempts.bucketUrl,
        createdAt: assignmentAttempts.createdAt,
        updatedAt: assignmentAttempts.updatedAt,
      })
      .from(assignmentAttempts)
      .execute();

    res.status(200).send(allAttempts);
  } catch (error: any) {
    console.error(`Error fetching attempts: ${error.message}`);
    res.status(500).send({
      message: "Error fetching attempts",
      error: error.message,
    });
  }
});

// Route to get a specific attempt by ID
router.get(
  "/getAttempt/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).send({ message: "Invalid attempt ID" });
        return;
      }

      const attempt = await getAttemptById(id);
      if (!attempt) {
        res.status(404).send({ message: "Attempt not found" });
        return;
      }

      res.status(200).send({
        message: "Attempt fetched successfully",
        data: attempt,
      });
    } catch (error: any) {
      console.error(`Error fetching attempt: ${error.message}`);
      res.status(500).send({
        message: "Error fetching attempt",
        error: error.message,
      });
    }
  }
);

// Route to create an attempt
router.post(
  "/createAttempt/:assignmentId",
  async (req: Request, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId, 10);
      const { files, userId } = req.body;

      // Validate assignmentId
      if (isNaN(assignmentId)) {
        return res.status(400).send({ message: "Invalid assignment ID" });
      }

      // Validate required fields
      if (!files) {
        return res.status(400).send({ message: "Files are required" });
      }

      // Validate assignment exists
      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, assignmentId))
        .execute();

      if (!assignment) {
        return res.status(404).send({ message: "Assignment not found" });
      }

      // Check if user already has an attempt for this assignment
      const [existingAttempt] = await db
        .select()
        .from(assignmentAttempts)
        .where(
          and(
            eq(assignmentAttempts.assignmentId, assignmentId),
            eq(assignmentAttempts.userId, userId)
          )
        )
        .execute();

      if (existingAttempt) {
        return res.status(400).send({
          message: "You already have an attempt for this assignment",
          attemptId: existingAttempt.id,
        });
      }

      // Generate object name and save file content in MinIO
      const objectName = `attempt-${assignmentId}-${userId}-${Date.now()}.json`;
      const fileContent = JSON.stringify(files, null, 2);
      await minioClient.putObject(bucketName, objectName, fileContent);

      // Generate MinIO URL
      const presignedUrl = await minioClient.presignedGetObject(
        bucketName,
        objectName,
        24 * 60 * 60 // 24 hours
      );

      // Create attempt record
      const [newAttempt] = await db
        .insert(assignmentAttempts)
        .values({
          assignmentId,
          userId,
          status: "submitted",
          bucketUrl: presignedUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      res.status(201).send({
        message: "Attempt created successfully",
        data: newAttempt,
      });
    } catch (error: any) {
      console.error(`Error creating attempt: ${error.message}`);
      res.status(500).send({
        message: "Error creating attempt",
        error: error.message,
      });
    }
  }
);

// Route to submit attempt for evaluation
router.post(
  "/submitAttemptForEval/:id",
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).send({ message: "Invalid attempt ID" });
        return;
      }

      const { files } = req.body;
      if (!files) {
        res.status(400).send({ message: "Files are required for submission" });
        return;
      }

      // Get the attempt
      const attempt = await getAttemptById(id);
      if (!attempt) {
        res.status(404).send({ message: "Attempt not found" });
        return;
      }

      // Update files in MinIO
      const objectName = `attempt-${attempt.assignmentId}-${Date.now()}.json`;
      const fileContent = JSON.stringify(files, null, 2);
      await minioClient.putObject(bucketName, objectName, fileContent);

      // Generate new presigned URL
      const presignedUrl = await minioClient.presignedGetObject(
        bucketName,
        objectName,
        24 * 60 * 60
      );

      // Update attempt status and files
      const [updatedAttempt] = await db
        .update(assignmentAttempts)
        .set({
          status: "submitted",
          bucketUrl: presignedUrl,

          updatedAt: new Date(),
        })
        .where(eq(assignmentAttempts.id, id))
        .returning()
        .execute();

      res.status(200).send({
        message: "Attempt submitted successfully",
        data: updatedAttempt,
      });
    } catch (error: any) {
      console.error(`Error submitting attempt: ${error.message}`);
      res.status(500).send({
        message: "Error submitting attempt",
        error: error.message,
      });
    }
  }
);

export default router;
