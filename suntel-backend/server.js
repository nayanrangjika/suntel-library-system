const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'suntel_super_secret_key_2026';

app.use(cors());
app.use(express.json()); // Allows us to read JSON request payloads

// ==========================================
// 1. MIDDLEWARE (Role-Based Access Control)
// ==========================================

// Validates the JWT Token
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        req.user = user; // Attach user info (id, role) to the request
        next();
    });
};

// Checks if the logged-in user is an Admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
};

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================

// Register a new user
app.post('/auth/register', async (req, res) => {
    const { username, password, role } = req.body;

    // Validation
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'user' // Default to 'user' if not provided
            }
        });

        res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." }); // Requested error message
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Issue JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// ==========================================
// 3. CORE FEATURES (BOOK CRUD)
// ==========================================

// GET /books: Fetch all books (Secured: Any authenticated user)
app.get('/books', authenticateJWT, async (req, res) => {
    try {
        const books = await prisma.book.findMany();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch books." });
    }
});

// POST /books: Add a new book (Secured: Admin only)
app.post('/books', authenticateJWT, isAdmin, async (req, res) => {
    const { title, author, publishedYear } = req.body;

    if (!title || !author || !publishedYear) {
        return res.status(400).json({ error: "Title, author, and publishedYear are required." });
    }

    try {
        const book = await prisma.book.create({
            data: { title, author, publishedYear: parseInt(publishedYear) }
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: "Failed to add book." });
    }
});

// PUT /books/:id: Update a book (Secured: Admin only)
app.put('/books/:id', authenticateJWT, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, author, publishedYear } = req.body;

    try {
        const book = await prisma.book.update({
            where: { id },
            data: { title, author, publishedYear: parseInt(publishedYear) }
        });
        res.json(book);
    } catch (error) {
        res.status(404).json({ error: "Book not found or failed to update." });
    }
});

// DELETE /books/:id: Delete a book (Secured: Admin only)
app.delete('/books/:id', authenticateJWT, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.book.delete({ where: { id } });
        res.json({ message: "Book deleted successfully." });
    } catch (error) {
        res.status(404).json({ error: "Book not found." });
    }
});

// PATCH /books/:id/status: Update status (Secured: Authenticated users)
app.patch('/books/:id/status', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'available' && status !== 'borrowed') {
        return res.status(400).json({ error: "Status must be 'available' or 'borrowed'." });
    }

    try {
        const book = await prisma.book.update({
            where: { id },
            data: { status }
        });
        res.json(book);
    } catch (error) {
        res.status(404).json({ error: "Book not found." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});