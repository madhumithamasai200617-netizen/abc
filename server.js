require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt"); // ✅ ADDED
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "@pathi@rana@81@",
    database: "fake_id_detection"
});

db.connect((err) => {
    if (err) {
        console.log("DB Connection Failed ❌", err);
    } else {
        console.log("Database Connected ✅");
    }
});

// ✅ Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Home Route
app.get("/", (req, res) => {
    res.send("Fake ID Detection API Running...");
});

// ==========================
// ✅ SIGNUP API (HASHED)
// ==========================
app.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ message: "All fields required ❌" });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [email], async (err, result) => {

        if (err) return res.json(err);

        if (result.length > 0) {
            return res.json({ message: "User already exists ⚠️" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10); // ✅ HASH

            const insertSql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            `;
            
            

            db.query(insertSql, [name, email, hashedPassword], (err) => {

                if (err) return res.json(err);

                res.json({ message: "Signup successful ✅" });
            });

        } catch (error) {
            res.json({ message: "Error hashing password ❌" });
        }

    });

});

// ==========================
// ✅ LOGIN API (COMPARE HASH)
// ==========================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ message: "All fields required ❌" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) return res.json(err);

        if (result.length === 0) {
            return res.json({ message: "User not found ❌" });
        }

        const user = result[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password); // ✅ COMPARE

            if (isMatch) {
                res.json({
                    message: "Login successful ✅",
                    user: user
                });
            } else {
                res.json({ message: "Invalid password ❌" });
            }

        } catch (error) {
            res.json({ message: "Error comparing password ❌" });
        }

    });

});

// ==========================
// ✅ ANALYZE API
// ==========================
app.post("/analyze", async (req, res) => {

    console.log("BODY RECEIVED:", req.body);

    try {
        const {
            userid,
            username,
            followers,
            following,
            posts,
            bio,
            joined
        } = req.body;

        if (
            followers === undefined ||
            following === undefined ||
            posts === undefined ||
            bio === undefined
        ) {
            return res.status(400).json({
                result: "Missing required fields."
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash" // ✅ stable model
        });

        const prompt = `
You are a fake account detection expert.

Analyze the following profile.

User ID: ${userid}
Username: ${username}
Followers: ${followers}
Following: ${following}
Posts: ${posts}
Bio: ${bio}
Date Joined: ${joined}

Return ONLY:

Status: REAL or FAKE
Suspicious Percentage: xx%
Reason: short paragraph
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const sql = `INSERT INTO analysis 
        (userid, username, followers, following, posts, bio, result)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(
            sql,
            [userid, username, followers, following, posts, bio, text],
            (err) => {
                if (err) {
                    console.log("Analysis Save Error ❌", err);
                } else {
                    console.log("Analysis Saved ✅");
                }
            }
        );

        res.json({
            success: true,
            result: text
        });

    } catch (error) {
        console.error(error);

        if (error.status === 503) {
            return res.status(503).json({
                error: "AI server busy ⚠️ Try again later"
            });
        }

        res.status(500).json({ error: "Something went wrong ❌" });
    }

});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
