import type { NextApiRequest, NextApiResponse } from "next"
import nodemailer from "nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { type, title, message } = req.body

  if (!type || !title || !message) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Configure your SMTP transport (replace with your real credentials)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.FEEDBACK_EMAIL_USER, // e.g. your Gmail address
      pass: process.env.FEEDBACK_EMAIL_PASS, // app password or real password
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.FEEDBACK_EMAIL_USER,
      to: "andyhluu23@gmail.com",
      subject: `[Prologue Platform Feedback] ${type}: ${title}`,
      text: message,
      html: `<h2>Platform Feedback</h2><p><b>Type:</b> ${type}</p><p><b>Title:</b> ${title}</p><p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>`
    })
    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: "Failed to send email" })
  }
} 