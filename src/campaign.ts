import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./middlewares/authMiddleware";
import { MyRequest } from "./types/requestTypes";
import { sendEmail } from "./utils/email";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/campaign/users",
  authMiddleware,
  async (req: MyRequest, res: Response) => {
    const { filter } = req.query;

    try {

      let users;
      let totalUsersCount;
      if (filter === "non-paid") {
        users = await prisma.user.findMany({
          where: {
            order: {
              some: {
                paid_at: null,
              },
            },
          },
        });
        totalUsersCount = await prisma.user.count({
          where: {
            order: {
              some: {
                paid_at: null,
              },
            },
          },
        });
      } else if (filter === "registered") {
        users = await prisma.user.findMany({
          where: {
            order: {
              none: {},
            },
          },
        });
        totalUsersCount = await prisma.user.count({
          where: {
            order: {
              none: {},
            },
          },
        });
      } else {
        users = await prisma.user.findMany({
        });
        totalUsersCount = await prisma.user.count();
      }

      res.status(200).json({
        message: "Users list retrieved successfully",
        data: users,
        meta: {
          total: totalUsersCount,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving users list", error });
    }
  }
);

router.post("/send-email-campaign", authMiddleware, async (req: MyRequest, res: Response) => {
  const { list_user, template_name } = req.body;

  if (!Array.isArray(list_user) || list_user.length === 0) {
    return res.status(400).json({ message: "Invalid list of users" });
  }

  if (!template_name) {
    return res.status(400).json({ message: "Template name is required" });
  }

  try {
    // Fetch the email template from the database
    const emailTemplate = await prisma.template_email.findFirst({
      where: {
        template_name: template_name,
        deleted_at: null, // Ensure the template is not deleted
      },
    });

    if (!emailTemplate) {
      return res.status(404).json({ message: "Email template not found" });
    }

    let templateData = {}

    // Send the email using the sendEmail function
    await sendEmail(list_user, "Playport " + template_name, template_name, emailTemplate.template, "email_campaign", templateData);

    return res.status(200).json({ message: "Email campaign sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending email campaign", error });
  }
});




export default router;
