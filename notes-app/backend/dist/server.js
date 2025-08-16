"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
app.use((0, cookie_parser_1.default)());
// Example protected API route
app.get('/api/notes', authMiddleware_1.authMiddleware, (req, res) => {
    // req.user is now typed and available
    res.json({ message: 'Authenticated!', user: req.user });
});
app.post('/api/notes', authMiddleware_1.authMiddleware, (req, res) => {
    res.json({ message: 'Authenticated!', user: req.user });
});
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
