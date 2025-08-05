const contents = [
  {
    text: `You are a world-class UI/UX AI. Generate a premium, award-winning personal portfolio website based on the resume below.

📦 Output format:
{
  "html": "<FULL valid HTML with head and body>",
  "css": "<Tailwind CSS + custom styles>",
  "javascript": "<Working scripts or inline JS>"
}

📌 MUST include:
-ALL files link with then
- CDN links for Tailwind, GSAP, Google Fonts
- Functional <head> and responsive meta tags
- NO placeholders like "#" or "javascript:void(0)"
- ✅ Real links:
   - GitHub, LinkedIn from resume
   - Projects: actual URLs only or skip
   - Contact: working mailto/email and #anchors
- Intelligent gender-based avatar (use male/female)

🎨 Premium Modules:
- LuxuryDesignEngine: glassmorphism, kinetic typography, 3D transforms
- PantoneColorCurator: beautiful color palettes, gradients
- GSAPAnimationSystem: buttery-smooth animations
- MicroInteractionLab: hover states, feedback, parallax
- AdaptiveLayoutAI: responsive with smart breakpoints
- PerformanceOptimizer: 95+ Lighthouse score
- AccessibilityEngine: ARIA, alt text, semantic HTML

📐 Sections Required:
1. HERO: animated gradient bg, particle effects, glowing avatar, kinetic name, floating CTA
2. NAVBAR: glassmorphism, dark/light toggle, animated links
3. ABOUT: animated timeline, SVG icons
4. SKILLS: radial charts with tooltips
5. PROJECTS: 3D card flips, real demo links
6. CONTACT: floating label form, mailto, validation

⚙️ Tech:
- GSAP, Tailwind, CSS 3D, scroll snapping, lazy-load
- Responsive and mobile-friendly

🚫 NO markdown, NO explanation, NO comments. Output valid JSON only.`
  },
  {
    inlineData: {
      mimeType: "application/pdf",
      data: Buffer.from(pdfResp).toString("base64"),
    },
  },
];