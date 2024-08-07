import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { MyRequest } from "./types/requestTypes";
import { authMiddleware } from "./middlewares/authMiddleware";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/template-email", authMiddleware, async (req: MyRequest, res: Response) => {
  const { template_name, template } = req.body;

  try {
    const newTemplate = await prisma.template_email.create({
      data: {
        template_name,
        template,
      },
    });

    res.status(201).json({
      message: "Email template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error creating email template", error });
  }
});

router.get("/template-email", authMiddleware, async (req: MyRequest, res: Response) => {
  const { page, limit } = req.query;

  try {
    const parsedPage = page ? parseInt(page as string, 10) : 1;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;
    const offset = (parsedPage * parsedLimit) - parsedLimit;

    const templates = await prisma.template_email.findMany({
      skip: offset,
      take: parsedLimit,
      orderBy: {
        created_at: "asc",
      },
      where: {
        deleted_at: null,
      },
    });

    const totalCount = await prisma.template_email.count({
      where: {
        deleted_at: null,
      },
    });

    return res.status(200).json({
      message: "Email templates retrieved successfully",
      data: templates,
      meta: {
        total: totalCount,
        page: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving email templates", error });
  }
});

router.get("/template-email/:id", authMiddleware, async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  const template = await prisma.template_email.findUnique({
    where: {
      id: parseInt(id, 10),
      deleted_at: null,
    },
  });

  if (!template) {
    return res.status(404).json({ message: "Email template not found" });
  }

  return res.status(200).json({
    message: "Email template retrieved successfully",
    data: template,
  });
});

router.put("/template-email/:id", authMiddleware, async (req: MyRequest, res: Response) => {
  const { id } = req.params;
  const { template_name, template } = req.body;

  let updatedTemplate: any;
  try {
    updatedTemplate = await prisma.template_email.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        template_name,
        template,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating email template", error });
  }

  if (!updatedTemplate) {
    return res.status(404).json({ message: "Email template not found" });
  }

  return res.status(200).json({
    message: "Email template updated successfully",
    data: updatedTemplate,
  });
});

router.delete("/template-email/:id", authMiddleware, async (req: MyRequest, res: Response) => {
  const { id } = req.params;

  try {
    const deletedTemplate = await prisma.template_email.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        deleted_at: new Date(),
      },
    });

    if (!deletedTemplate) {
      return res.status(404).json({ message: "Email template not found" });
    }

    return res.status(200).json({
      message: "Email template deleted successfully",
      data: deletedTemplate,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting email template", error });
  }
});

router.get("/template-email/all", authMiddleware, async (req: MyRequest, res: Response) => {
    let templateEmail: {
        id: number;
        template_name: string;
        template: string;
    }[] = []
    try {
        templateEmail = await prisma.template_email.findMany({
            select: {
                id: true,
                template_name: true,
                template: true
            }
        })
    } catch(error) {
        return res.status(500).json({ message: "Error get all template email"})
    }
    
    return res.status(200).json({ message: "Success", data: templateEmail})

})


export default router;