import {Request} from "express";

export interface MyRequest extends Request {
    user?: { admin_user_id: number};
}