import express from "express";
import minioClient from "../../utils/minioClient";

interface Template {
  name: string;
  size: number;
  lastModified: Date;
}

const router = express.Router();

router.get("/get-templates", async (req, res) => {
  try {
    const bucketName = "templates";
    const templates: Array<{ name: string; size: number; lastModified: Date }> =
      [];

    // Create a stream to list objects in the bucket
    const stream = minioClient.listObjects(bucketName, "", true);

    stream.on("data", (obj) => {
      // Push each object into the array
      templates.push({
        name: obj.name || "unknown",
        size: obj.size ?? 0,
        lastModified: obj.lastModified ?? new Date(0),
      });
    });

    stream.on("end", () => {
      // Send the collected templates once the stream ends
      res.status(200).send({
        message: "Templates fetched successfully",
        data: templates,
      });
    });

    stream.on("error", (error) => {
      console.error("Error fetching objects from MinIO bucket:", error);
      res.status(500).send({ message: "Error fetching templates" });
    });
  } catch (error) {
    console.error(`Error fetching templates: ${error}`);
    res.status(500).send({ message: "Error fetching templates" });
  }
});

router.post("/create-template", async (req, res) => {
  try {
    const { name, data } = req.body;
    const bucketName = "templates";

    // Create a stream to upload the template
    const uploadedObjectInfo = await minioClient.putObject(
      bucketName,
      name,
      data
    );

    // Check if the upload was successful by examining the returned information
    if (uploadedObjectInfo) {
      res.status(200).send({ message: "Template created successfully" });
    } else {
      res.status(500).send({ message: "Error creating template" });
    }
  } catch (error) {
    console.error(`Error creating template: ${error}`);
    res.status(500).send({ message: "Error creating template" });
  }
});

export default router;
