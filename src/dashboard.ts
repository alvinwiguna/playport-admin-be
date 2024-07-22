import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { MyRequest } from "./types/requestTypes";

const prisma = new PrismaClient();
const router = express.Router();

router.get(
  "/transaction-metrics/:metrics_name",
  async (req: MyRequest, res: Response) => {
    const { metrics_name } = req.params;
    const { start_date, end_date } = req.query;

    try {
      // Fetch the transaction metrics based on the metrics name
      const transactionMetric = await prisma.transaction_metrics.findFirst({
        where: { metrics_name },
      });

      if (!transactionMetric) {
        return res
          .status(404)
          .send({ message: "Transaction metric not found." });
      }

      let queryResult: any;
      if (metrics_name === "total_user") {
        queryResult = await prisma.$queryRawUnsafe(
          `${transactionMetric.query}`
        );
      } else {
        // Execute the query stored in the transaction metrics with start date and end date
        queryResult = await prisma.$queryRawUnsafe(
          `${transactionMetric.query}`,
          start_date,
          end_date
        );
      }

      const jsonResult = JSON.stringify(queryResult, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      );
      const data = JSON.parse(jsonResult);

      res.status(200).send({ data });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error retrieving transaction metrics.", error });
    }
  }
);

export default router;
