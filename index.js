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
    text: `You are a UI/UX AI. Generate a premium, award-winning personal portfolio website from the resume.

Real links Responsive head/meta/title/favicon • Avatar img src https://i.ibb.co/gpJXs27/yash2.jpg), No dummy links.

- Rich color palette (Pantone/gradient) use white, glassmorphism backgrounds
- Responsive and mobile-friendly layout

Required sections are below -
1.Navbar SECTION: Fixed top navbar with smooth scroll
- Left: Logo or name
- Right: Menu links to sections (Work, Projects, Skills, Contact)
- Active link highlight on scroll
- Responsive mobile menu with hamburger
2.HERO SECTION:
Clean white/cream static BG, subtle glass particles, glowing avatar
Full name (48px kinetic text)
Job title (22px gray)
Summary (18px muted)
Location (pink)
"Hire Me!" CTA + social icons (GitHub, LinkedIn, Twitter, Email)
3 floating CTAs: About, Projects, Contact

If work experience exists, include it in the position specified in the resume; otherwise, skip it and render the other sections as listed.
 3.WORK EXPERIENCE SECTION:(take all info from resumes)
- Each job with: company logo, job title (22px bold), company name (16px gray), date (pill badge)
- Monospace layout (IBM Plex Mono)
- GSAP animations: fade-up or staggered
If project header in resumes exists, include it in the position specified in the resume; otherwise, skip it and render the other sections as listed.
 PROJECTS SECTION:
- "Proof of Work" badge with grid card layout
- Each card: image, name, date, live status badge, description, tech stack tags
- Buttons: "Website", "Source Code" (real links only)
- Responsive layout, GSAP hover/fade animations

If education header in resumes exists, include it in the position specified in the resume; otherwise, skip it and render the other sections as listed.
 EDUCATION SECTION (take all info from resumes)
Degree, Institution, Duration (badge)
Logo/icon (left), monospace text (right)
If skills header in resumes exists, include it in the position specified in the resume; otherwise, skip it and render the other sections as listed.
SKILLS SECTION (take all info from resumes)
Heading: "Skills" (bold monospace)
Tech Stack: Black pill tags (white text, padded)
Layout: Flex/grid, responsive, sorted (alphabetical/category)

If contact info in resumes exists, include it in the position specified in the resume; otherwise, skip it and render the other sections as listed.
 CONTACT SECTION (take all info from resumes)
Title: "Get in Touch"
CTA: "DM on Twitter" / "Email me" (use resume contact)

 FOOTER SECTION:
- Owner’s name, real social icons, email
- No dummy links all link should be working.
- Monospaced, soft hover, responsive stack, top border

Include all headers present in the resume. For each header, create a section only if the corresponding content exists; if no content exists for that header, skip the section entirely.
EXTRA SECTIONS (if any other header present in resumes make a new section):
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
