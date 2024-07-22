import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { authMiddleware } from "./middlewares/authMiddleware";
import { MyRequest } from "./types/requestTypes";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

router.post("/promo-codes", async (req: Request, res: Response) => {
  const {
    code,
    for_user_id,
    req_game_id,
    req_min_month,
    req_min_ram,
    req_min_trx_value,
    disc_percent,
    disc_nominal,
    disc_max_value,
    disc_duration_months,
    affiliate_percent,
    affiliate_nominal,
    affiliate_max_value,
    affiliate_duration_months,
    started_at,
    expired_at,
    usage_limit,
  } = req.body;

  if (
    !code ||
    disc_percent === undefined ||
    !started_at ||
    !expired_at ||
    usage_limit === undefined
  ) {
    return res
      .status(400)
      .send({ message: "All mandatory fields are required." });
  }

  const promoCodeData: any = {
    code,
    disc_percent,
    disc_nominal,
    disc_max_value,
    disc_duration_months,
    affiliate_percent,
    affiliate_nominal,
    affiliate_max_value,
    affiliate_duration_months,
    started_at: new Date(started_at),
    expired_at: new Date(expired_at),
    usage_limit,
  };

  if (for_user_id !== undefined) {
    promoCodeData.for_user_id = for_user_id;
  }
  if (req_game_id !== undefined) {
    promoCodeData.req_game_id = req_game_id;
  }
  if (req_min_month !== undefined) {
    promoCodeData.req_min_month = req_min_month;
  }
  if (req_min_ram !== undefined) {
    promoCodeData.req_min_ram = req_min_ram;
  }
  if (req_min_trx_value !== undefined) {
    promoCodeData.req_min_trx_value = req_min_trx_value;
  }

  try {
    const promoCode = await prisma.promo_code.create({
      data: promoCodeData,
    });

    res
      .status(200)
      .send({ message: "Promo code created successfully.", promoCode });
  } catch (error) {
    res.status(500).send({ message: "Error creating promo code.", error });
  }
});

router.get("/promo-codes", async (req: Request, res: Response) => {
  try {
    const promoCodes = await prisma.promo_code.findMany();
    res.status(200).send(promoCodes);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving promo codes.", error });
  }
});

export default router;
