import express from "express";
import minioClient from "../../utils/minioClient";

interface ObjectInfo {
  name?: string;
  lastModified: Date;
  etag: string;
  size: number;
}

type BucketItem = {
  name: string; // Make name required in our internal type
  lastModified: Date;
  etag: string;
  size: number;
};

const router = express.Router();

router.get("/list", (req, res) => {
  try {
    const bucketName = "assignments";
    const objectList: BucketItem[] = [];
    const stream = minioClient.listObjects(bucketName, "", true);
    stream.on("data", (obj: ObjectInfo) => {
      if (obj.name) {
        const item: BucketItem = {
          name: obj.name, // We know name is defined here due to the if check
          lastModified: obj.lastModified,
          etag: obj.etag,
          size: obj.size,
        };
        objectList.push(item);
      }
    });

    stream.on("end", () => {
      res.status(200).send({
        message: "List of assignments fetched successfully",
        data: objectList,
      });
    });
    stream.on("error", (error) => {
      console.error("Error fetching objects from MinIO bucket:", error);
      res.status(500).send({ message: "Error fetching assignments" });
    });
  } catch (error) {
    console.error(`Error fetching assignments: ${error}`);
    res.status(500).send({ message: "Error fetching assignments" });
  }
});

router.get("/list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bucketName = "assignments";
    const objectName = `assignment-${id}.json`;

    const stream = await minioClient.getObject(bucketName, objectName);

    let data = "";
    stream.on("data", (chunk) => {
      data += chunk;
    });

    stream.on("end", () => {
      res.status(200).send({
        message: "Assignment fetched successfully",
        data: JSON.parse(data),
      });
    });

    stream.on("error", (error) => {
      console.error("Error fetching object from MinIO bucket:", error);
      res.status(500).send({ message: "Error fetching assignment" });
    });
  } catch (error) {
    console.error(`Error fetching assignment: ${error}`);
    res.status(500).send({ message: "Error fetching assignment" });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { id, file } = req.body;
    const bucketName = "assignments";
    const objectName = `assignment-${id}.json`;
    const fileContent = JSON.stringify(file, null, 2);

    await minioClient.putObject(bucketName, objectName, fileContent);
    res.status(200).send({ message: "Assignment saved" });
  } catch (error) {
    console.error(`Error saving assignment: ${error}`);
    res.status(500).send({ message: "Error saving assignment" });
  }
});

// router.post("/edit/:id", async (req, res) => {
//   try {
//     const { id, file } = req.body;
//     const bucketName = "assignments";
//     const objectName = `assignment-${id}.json`;
//     const fileContent = JSON.stringify(file, null, 2);

//     const stream = minioClient.listObjects(bucketName, "", true);
//     stream.on("data", (obj) => {
//     if (obj.name) { // Ensure name exists
//     objectList.push({
//       name: obj.name,
//       lastModified: obj.lastModified,
//       etag: obj.etag,
//       size: obj.size,
//     });
//   }
// });
//   } catch (error) {
//     console.error(`Error updating assignment: ${error}`);
//     res.status(500).send({ message: "Error updating assignment" });
//   }
// });
export default router;
