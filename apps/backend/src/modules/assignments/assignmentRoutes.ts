import express from "express";

const router = express.Router();

router.get("/list", (req, res) => {
  res.send("Hello World");
});

router.post("/create", (req, res) => {
  console.log(`Request Body`, req.body);
  res.send("Created new assignment attempt");
});

export default router;
