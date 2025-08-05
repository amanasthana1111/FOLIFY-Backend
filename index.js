import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Ensure ./files folder exists
const filesDir = path.join(process.cwd(), "files");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./files");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Test route
app.get("/", (req, res) => {
  res.json({ mess: "running" });
});

// ✅ PDF upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const localFilePath = path.join(process.cwd(), "files", req.file.filename);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
      folder: "resumes",
    });

    const ai = new GoogleGenAI({
      apiKey: process.env.GoogleGenAI,
    });

    const pdfResp = await fetch(`${result.secure_url}`).then((response) =>
      response.arrayBuffer()
    );

    const contents = [
      {
        text: `You are a system that analyzes resumes against job descriptions. You must extract key data from the resume and compare it with the job posting. Respond with JSON containing:

{
  "job_position": "string",
  "ats_score": "percentage",
  "matched_keywords": ["string"],
  "missing_keywords": ["string"],
  "suggestions": ["string"],
  "recommendations": ["string"]
}

Modules you have:
- ResumeParser: Extracts text, keywords, contact info, education, and experience from resume.
- JobDescriptionParser: Parses job description for required skills, title, experience.
- ATSMatcher: Matches resume with job description and calculates ATS score.
- SuggestionEngine: Provides suggestions for resume improvement.
- JSONOutputFormatter: Outputs everything in clean structured JSON.

Now analyze the resume and return results based on this format.
`,
      },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: Buffer.from(pdfResp).toString("base64"),
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    let raw = await response.text;

    let rawdata = raw
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
    const data = JSON.parse(rawdata);

    res.status(200).json(data);

    // ✅ Delete local file (optional cleanup)
    fs.unlinkSync(localFilePath);
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return res.status(500).json({ error: "Upload to Cloudinary failed" });
  }
});

app.post("/gererate", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const localFilePath = path.join(process.cwd(), "files", req.file.filename);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
      folder: "resumes",
    });

    const ai = new GoogleGenAI({
      apiKey: process.env.GoogleGenAI,
    });

    const pdfResp = await fetch(`${result.secure_url}`).then((response) =>
      response.arrayBuffer()
    );

    const contents = [
  {
    text: `You are a world-class UI/UX AI. Generate a premium, award-winning personal portfolio website from the resume below.

Real links (GitHub, LinkedIn, Projects, Email) • Tailwind, GSAP, Google Fonts CDN • Responsive head/meta/title/favicon • Avatar (gender-based or default https://i.ibb.co/gpJXs27/yash2.jpg) • No dummy links.

- Rich color palette (Pantone/gradient) use white, glassmorphism backgrounds
- Particle background using CSS/JS (minimal)
- Responsive and mobile-friendly layout

Required Sections:

1. HERO SECTION:
Clean white or cream static background, subtle glass particles, glowing avatar- Full name in 48px kinetic text
- Job title in 22px gray text
- Summary in 18px muted text
- 📍 Location in pink-colored text
- "Hire Me!" CTA + social links (GitHub, LinkedIn, Twitter, Email)
- 3 floating CTA buttons: Resume (PDF), Projects, Contact

2. WORK EXPERIENCE:
- Each job with: company logo, job title (22px bold), company name (16px gray), date (pill badge)
- Monospace layout (IBM Plex Mono)
- GSAP animations: fade-up or staggered

3. PROJECTS:
- "Proof of Work" badge with grid card layout
- Each card: image, name, date, live status badge, description, tech stack tags
- Buttons: "Website", "Source Code" (real links only)
- Responsive layout, GSAP hover/fade animations

4. EDUCATION:
- Degree name, institution, duration/date badge
- Logo/icon left-aligned, monospace font right
- Responsive mobile layout

 6. SKILLS:
  - Section Heading: "Skills" in large bold monospaced font.
  - Tech Stack Tags:
    - Display each skill (e.g., React, TypeScript, etc.) in black pill-shaped tags with white text.
    - Padding: enough for visual clarity.
    - Use grid or flex wrap layout to fit tags responsively.
    - Sort alphabetically or by category (if inferred).

6. CONTACT:
- "Get in Touch" title
- “Want to chat? DM on Twitter” or “Email me” if no Twitter
- Use real contact from resume

7. FOOTER:
- Owner’s name, real social icons, email
- No dummy links
- Monospaced, soft hover, responsive stack, top border

8. EXTRA SECTIONS:
- Render extra resume sections with matching style & animation

ALL HTML, CSS, JS inside one HTML file.  
No markdown, placeholders, comments, or explanations.  

Output only:
{
  "html": "<FULL HTML with inline CSS & JS>"
}`
  },
  {
    inlineData: {
      mimeType: "application/pdf",
      data: Buffer.from(pdfResp).toString("base64"),
    },
  },
];


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    let raw = await response.text;

    let rawdata = raw
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
    const data = JSON.parse(rawdata);

    res.status(200).json(data);

    // ✅ Delete local file (optional cleanup)
    fs.unlinkSync(localFilePath);
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return res.status(500).json({ error: "Upload to Cloudinary failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
