import express from "express";
import type { Request, Response } from "express";
import minioClient from "../../utils/minioClient";
import { templates } from "../../db/schema";
import db from "../../db/index";
import { eq } from "drizzle-orm";

const router = express.Router();

router.post("/createTemplate", async (req: Request, res: Response) => {
  try {
    const { name, description, files } = req.body;
    const bucketName = "templates";

    const [newTemplate] = await db
      .insert(templates)
      .values({
        name,
        description,
        bucketUrl: "",
        updatedAt: new Date(),
      })
      .returning({ id: templates.id, name: templates.name }) // Return `id` and `name`
      .execute();

    const objectName = `${newTemplate.name || newTemplate.id}.json`;
    const filesContent = JSON.stringify(files, null, 2);

    await minioClient.putObject(bucketName, objectName, filesContent);

    const bucketUrl = `http://127.0.0.1:9090/browser/templates/${objectName}`;

    await db
      .update(templates)
      .set({ bucketUrl })
      .where(eq(templates.id, newTemplate.id));

    res.status(201).send({ message: "Template created", url: bucketUrl });
  } catch (error: any) {
    console.error(`Error creating template: ${error}`);
    res
      .status(500)
      .send({ message: "Error creating template", error: error.message });
  }
});

router.get("/getTemplates", async (_req: Request, res: Response) => {
  try {
    const allTemplates = await db
      .select({
        id: templates.id,
        name: templates.name,
        description: templates.description,
        bucketUrl: templates.bucketUrl,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
      })
      .from(templates)
      .execute(); // This returns an array of rows

    res.status(200).send(allTemplates); // Send the full array as the response
  } catch (error: any) {
    console.error(`Error getting templates: ${error}`);
    res
      .status(500)
      .send({ message: "Error getting templates", error: error.message });
  }
});

// router.post("editTemplate/:id", async (req: Request, res: Response) => {
//   try{
//     const { id } = req.params;
//     const { name, description, files } = req.body;
//     const bucketName = "templates";

//     const [template] = await db
//       .select({
//         id: templates.id,
//         name: templates.name,
//         description: templates.description,
//         bucketUrl: templates.bucketUrl,
//         createdAt: templates.createdAt,
//         updatedAt: templates.updatedAt,
//       })
//       .from(templates)
//       .where(eq(templates.id, template.id))
//       .execute();

//     if (!template) {
//       res.status(404).send({ message: "Template not found" });
//       return;
//     }

//     const objectName = `${template.name || template.id}.json`;
//     const filesContent = JSON.stringify(files, null, 2);

//     await minioClient.putObject(bucketName, objectName, filesContent);

//   }
// });

export default router;
