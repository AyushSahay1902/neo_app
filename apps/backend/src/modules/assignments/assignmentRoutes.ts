import express from "express";
import minioClient from "../../utils/minioClient";

const router = express.Router();

router.get("/list", (req, res) => {
  res.send("Hello World");
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

router.post("/create", (req, res) => {
  console.log(`Request Body`, req.body);
  res.send({ message: "Assignment created" });
});

export default router;
