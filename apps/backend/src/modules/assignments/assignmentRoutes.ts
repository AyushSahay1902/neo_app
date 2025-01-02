import express from "express";
import type { Request, Response, Router } from "express";
import minioClient from "../../utils/minioClient";
import db from "../../db/index";
import { assignments } from "../../db/schema";
import { eq } from "drizzle-orm";

const router: Router = express.Router();

const bucketName = "assignments";

// Helper function to get assignment by ID
const getAssignmentById = async (id: number) => {
  const [assignment] = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      bucketUrl: assignments.bucketUrl,
      createdAt: assignments.createdAt,
      updatedAt: assignments.updatedAt,
    })
    .from(assignments)
    .where(eq(assignments.id, id))
    .execute();
  return assignment;
};

// Route to list all assignments
router.get("/listAssignment", async (req: Request, res: Response) => {
  try {
    const allAssignments = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        bucketUrl: assignments.bucketUrl,
        difficulty: assignments.difficulty || "beginner",
        createdAt: assignments.createdAt,
        updatedAt: assignments.updatedAt,
      })
      .from(assignments)
      .execute();

    res.status(200).send(allAssignments);
  } catch (error: any) {
    console.error(`Error fetching assignments: ${error.message}`);
    res
      .status(500)
      .send({ message: "Error fetching assignments", error: error.message });
  }
});

// Route to get a specific assignment by ID
router.get(
  "/getAssignment/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).send({ message: "Invalid assignment ID" });
        return;
      }

      const assignment = await getAssignmentById(id);
      if (!assignment) {
        res.status(404).send({ message: "Assignment not found" });
        return;
      }

      res.status(200).send({
        message: "Assignment fetched successfully",
        data: assignment,
      });
    } catch (error: any) {
      console.error(`Error fetching assignment: ${error.message}`);
      res
        .status(500)
        .send({ message: "Error fetching assignment", error: error.message });
    }
  }
);

// Route to create an assignment
router.post("/createAssignment", async (req: Request, res: Response) => {
  try {
    const { title, description, template, file } = req.body;

    // Generate object name and save file content in MinIO
    const objectName = `assignment-${title}.json`;
    const fileContent = JSON.stringify(file, null, 2);
    await minioClient.putObject(bucketName, objectName, fileContent);

    // Generate MinIO URL and save the assignment in the database
    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      objectName,
      24 * 60 * 60
    );
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        title,
        description,
        templateId: template.id,
        bucketUrl: presignedUrl,
        difficulty: template.difficulty,
        updatedAt: new Date(),
      })
      .returning({
        id: assignments.id,
        title: assignments.title,
      })
      .execute();

    res.status(201).send({
      message: "Assignment created successfully",
      data: newAssignment,
    });
  } catch (error: any) {
    console.error(`Error creating assignment: ${error.message}`);
    res
      .status(500)
      .send({ message: "Error creating assignment", error: error.message });
  }
});

// Route to edit assignment files
router.put(
  "/editAssignment/:id",
  async (
    req: Request<{ id: string }, {}, { file: any }>, // Define path params and body type
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).send({ message: "Invalid assignment ID" });
      }

      const { file } = req.body;
      if (!file) {
        res.status(400).send({ message: "File content is required" });
      }

      console.log("file", file);

      const assignment = await getAssignmentById(id);
      if (!assignment) {
        res.status(404).send({ message: "Assignment not found" });
      }

      const objectName = `assignment-${assignment.title}.json`;
      const fileContent = JSON.stringify(file, null, 2);
      await minioClient.putObject(bucketName, objectName, fileContent);

      res
        .status(200)
        .send({ message: "Assignment files updated successfully" });
    } catch (error: any) {
      console.error(`Error updating assignment files: ${error.message}`);
      res.status(500).send({
        message: "Error updating assignment files",
        error: error.message,
      });
    }
  }
);

export default router;
