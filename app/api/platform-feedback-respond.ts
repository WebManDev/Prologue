import { NextApiRequest, NextApiResponse } from "next";
import { respondToFeedback } from "@/lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { feedbackId, response } = req.body;
  if (!feedbackId || !response) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    await respondToFeedback(feedbackId, response);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to respond to feedback" });
  }
} 