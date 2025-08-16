"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createNotes = (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body;
        const user = req.user;
        console.log("Creating note for user:", user);
        // Here you would typically call a service to handle the creation of the note
        // For example:
        // await noteService.createNote({ title, description, status, dueDate, userId: user.id });
        res.status(201).json({ message: "Note created successfully" });
    }
    catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
