import { Request, Response } from "express";
import {prisma} from "../db/prismaClient";

interface CustomRequest extends Request {
    user?: any;
}

export const createNotes = async (req:CustomRequest, res:Response) => {

    try {
        const { title, description, status, dueDate } = req.body;
        const user = req.user;

        const response = await prisma.note.create({
            data: {
                title,
                description,
                status,
                dueDate,
                userId: "123"
            }
        });

        if(!response) {
            return res.status(400).json({ message: "Failed to create note" });
        }

        console.log("Creating note for user:", user);
        res.status(201).json({ message: "Note created successfully" });

    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}