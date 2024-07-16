import express, {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt, {Secret} from "jsonwebtoken";
import {PrismaClient} from "@prisma/client";
import dotenv from "dotenv";
import moment from "moment";
import {PRISMA_LOGGING_SETTINGS} from "./utils/constants";

dotenv.config();

const prisma = new PrismaClient(PRISMA_LOGGING_SETTINGS);
const router = express.Router();

router.post("/register-admin", async (req: Request, res: Response) => {
    const {
        first_name,
        last_name,
        email,
        username,
        password
    } = req.body;

    if (
        !first_name ||
        !last_name ||
        !username ||
        !email ||
        !password
    ) {
        return res.status(400).send({message: "All fields are required."});
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user in the database
    const adminUser = await prisma.admin_user.create({
        data: {
            first_name: first_name,
            last_name: last_name,
            username: username,
            password: hashedPassword,
            email: email
        },
    });

    if (!adminUser) {
        return res
            .status(400)
            .send({
                message: "Admin user creation failure, please contact our customer service.",
            });
    }

    res.status(200).send({message: "Admin user created successfully."});
});

router.post("/login-admin", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required." });
    }

    // Retrieve admin user from the database
    const adminUser = await prisma.admin_user.findFirst({
        where: {
            username: username,
        },
    });

    if (!adminUser) {
        return res.status(400).send({ message: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
        return res.status(400).send({ message: "Invalid username or password." });
    }

    // Generate JWT Token
    let jwtSecretKey: Secret = process.env.JWT_SECRET as string;
    let tokenData = {
        admin_user_id: adminUser.id,
        username: adminUser.username,
    };
    const token = jwt.sign(tokenData, jwtSecretKey);

    await prisma.admin_login.create({
        data: {
            admin_user_id: adminUser.id,
            login_token: token,
            token_expired_at: moment().add(7, "days").toISOString(),
            user_agent: req.headers["user-agent"],
            ip_address: req.ip,
        },
    });

    res.status(200).send({ token: token });
});


export default router;
