import express from "express";
import minioClient from "../../utils/minioClient";
import db from "../../db/index";
import { assignments } from "../../db/schema";
import type { Request, Response } from "express";

interface FileContent {
  [key: string]: any;
}

type BucketItem = {
  name: string;
  lastModified: Date;
  etag: string;
  size: number;
};

const router = express.Router();

const getBucketObjects = async (bucketName: string): Promise<BucketItem[]> => {
  return new Promise((resolve, reject) => {
    const objectList: BucketItem[] = [];
    const stream = minioClient.listObjectsV2(bucketName, "", true);

    stream.on(
      "data",
      (obj: {
        name?: string;
        lastModified: Date;
        etag: string;
        size: number;
      }) => {
        if (obj.name) {
          objectList.push({
            name: obj.name,
            lastModified: obj.lastModified,
            etag: obj.etag,
            size: obj.size,
          });
        }
      }
    );

    stream.on("end", () => resolve(objectList));
    stream.on("error", (error) => reject(error));
  });
};

/**
 * Route to list assignments.
 */
router.get("/listAssignment", async (req: Request, res: Response) => {
  try {
    // Step 1: Fetch assignment data from the database
    const assignmentList = await db.select().from(assignments).execute();

    // Step 2: Fetch all objects from the MinIO bucket
    const bucketName = "assignments";
    const objectList = await getBucketObjects(bucketName);

    // Step 3: Combine DB and bucket data
    const combinedList = assignmentList.map((assignment) => {
      const bucketFile = objectList.find(
        (file) => file.name === assignment.bucketUrl
      );
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        templateId: assignment.templateId,
        bucketUrl: assignment.bucketUrl,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        bucketFileDetails: bucketFile || null, // Add MinIO file details if available
      };
    });

    res.status(200).send({
      message: "List of assignments fetched successfully",
      data: combinedList,
    });
  } catch (error: any) {
    console.error(`Error fetching assignments: ${error}`);
    res
      .status(500)
      .send({ message: "Error fetching assignments", error: error.message });
  }
});

router.post("/createAssignment", async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      templateId,
      file,
    }: {
      title: string;
      description: string;
      templateId: number;
      file: FileContent;
    } = req.body;

    const bucketName = "assignments";
    const objectName = `assignment-${Date.now()}.json`; // Use Date.now() or id generated elsewhere
    const fileContent = JSON.stringify(file, null, 2);

    // Upload the file to MinIO
    await minioClient.putObject(bucketName, objectName, fileContent);

    // Get the file URL
    const fileUrl = await minioClient.presignedGetObject(
      bucketName,
      objectName
    );

    // Insert assignment data into the database (exclude id as it is auto-generated)
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        title, // Title of the assignment
        description, // Description of the assignment
        templateId, // Reference to the template
        bucketUrl: fileUrl, // URL of the uploaded file
      })
      .returning(); // Use returning() to get the inserted row if needed

    res
      .status(200)
      .send({
        message: "Assignment saved successfully",
        fileUrl,
        newAssignment,
      });
  } catch (error) {
    console.error(`Error saving assignment: ${error}`);
    res.status(500).send({ message: "Error saving assignment" });
  }
});

// router.get("/getAssignment/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const bucketName = "assignments";
//     const objectName = `assignment-${id}.json`;

//     const stream = await minioClient.getObject(bucketName, objectName);

//     let data = "";
//     stream.on("data", (chunk) => {
//       data += chunk;
//     });

//     stream.on("end", () => {
//       res.status(200).send({
//         message: "Assignment fetched successfully",
//         data: JSON.parse(data),
//       });
//     });

//     stream.on("error", (error) => {
//       console.error("Error fetching object from MinIO bucket:", error);
//       res.status(500).send({ message: "Error fetching assignment" });
//     });
//   } catch (error) {
//     console.error(`Error fetching assignment: ${error}`);
//     res.status(500).send({ message: "Error fetching assignment" });
//   }
// });

// router.post("/editAssignment/:id", async (req, res) => {
//   try {
//     const { id, file } = req.body;
//     const bucketName = "assignments";
//     const objectName = `assignment-${id}.json`;
//     const fileContent = JSON.stringify(file, null, 2);

//     const stream = await minioClient.listObjects(bucketName, "", true);
//     let objectExists = false;
//     stream.on("data", (obj: ObjectInfo) => {
//       if (obj.name === objectName) {
//         objectExists = true;
//       }
//     });

//     stream.on("end", async () => {
//       if (objectExists) {
//         await minioClient.putObject(bucketName, objectName, fileContent);
//         res.status(200).send({ message: "Assignment updated" });
//       } else {
//         res.status(404).send({ message: "Assignment not found" });
//       }
//     });
//   } catch (error) {
//     console.error(`Error updating assignment: ${error}`);
//     res.status(500).send({ message: "Error updating assignment" });
//   }
// });
export default router;
