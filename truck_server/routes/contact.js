import express from "express";

const router = express.Router();

// In-memory log of contact submissions
const contactSubmissions = [];

router.post("/", (req, res) => {
  const { name, email, organization, tradeLane, message } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ success: false, message: "Please provide your name." });
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, message: "Please provide your inquiry message." });
  }

  const submission = {
    id: `contact_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    organization: (organization || "").trim() || "Not specified",
    tradeLane: tradeLane || "General Bulk Trade",
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };

  contactSubmissions.push(submission);
  console.log(`[Contact Form Received] from ${submission.name} (${submission.email}) for ${submission.organization}`);

  return res.status(200).json({
    success: true,
    message: "Thank you! Your inquiry has been received. Our chartering intelligence team will get back to you shortly.",
    submissionId: submission.id,
  });
});

export default router;
