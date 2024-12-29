import express from "express";
import type { Request, Response } from "express";
import minioClient from "../../utils/minioClient";
import { templates } from "../../db/schema";
import db from "../../db/index";

const router = express.Router();

router.post("/createTemplate", async (req: Request, res: Response) => {
  try {
    const { templateName, templateContent, description } = req.body;

    if (!templateName || !templateContent) {
      return res.status(400).send("Template name and content are required.");
    }

    // Upload the template to MinIO
    await minioClient.putObject(
      "templates", // Bucket name
      templateName, // File name
      JSON.stringify(templateContent) // Content
    );

    // Get the presigned URL for the uploaded template
    const url = await minioClient.presignedGetObject("templates", templateName);

    // Save the template details into the database
    await db.insert(templates).values({
      name: templateName,
      description: description || "", // Optional description
      bucketUrl: url,
    });

    // Respond with the URL
    res.status(200).json({ url });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred while creating the template.");
  }
});

// router.get("getTemplates", async (req, res) => {
//   try {
//     //get templates
//   }
// });

export default router;
