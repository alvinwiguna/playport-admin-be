import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_PLAYPORT,
      pass: process.env.GMAIL_PLAYPORT_PASS,
    },
  });
  
  async function sendEmail(
    to: string[],
    subject: string,
    templateName: string,
    template: string,
    category: string,
    templateData: Record<string, string>
  ) {  

    const htmlContent = template;

    // Loop through the recipients and send the email
    for (const recipient of to) {

      const user = await prisma.user.findFirst({
        where: {
          email: recipient,
        },
      });

      if (!user) {
        throw new Error(`User with email ${recipient} not found`);
      }

       // Replace placeholders with actual data
    let processedHtml = htmlContent;
    for (const key in user) {
      if (Object.prototype.hasOwnProperty.call(user, key)) {
        const placeholder = `{{${key}}}`;
        processedHtml = processedHtml.replace(
          new RegExp(placeholder, "g"),
          (user as Record<string, any>)[key] 
        );
      }
    }

    for (const key in templateData) {
        if (Object.prototype.hasOwnProperty.call(templateData, key)) {
          const placeholder = `{{${key}}}`;
          processedHtml = processedHtml.replace(
            new RegExp(placeholder, "g"),
            templateData[key] 
          );
        }
      }


      const mailOptions = {
        from: "no-reply@playport.co.id",
        to: recipient,
        subject: subject,
        html: processedHtml,
      };

      // Send email
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            await prisma.log_email_send.create({
                data: {
                    log_type: "ERROR",
                    category: category,
                    email_template: templateName,
                    from: mailOptions.from,
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    body: mailOptions.html,
                }
            })
        } else {
            await prisma.log_email_send.create({
                data: {
                  log_type: "SUCCESS",
                  category: category,
                  email_template: templateName,
                  from: mailOptions.from,
                  to: mailOptions.to,
                  subject: mailOptions.subject,
                  body: mailOptions.html,
                },
              });
        }
      });
    }
  }
  
  export {sendEmail};