import { NextApiRequest, NextApiResponse } from "next";
import { addFeedback, getAllFeedback, respondToFeedback } from "@/lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Add feedback
    const { type, title, message, userId } = req.body;
    if (!type || !title || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const docRef = await addFeedback({ type, title, message, userId });
      return res.status(200).json({ success: true, id: docRef.id });
    } catch (e) {
      return res.status(500).json({ error: "Failed to add feedback" });
    }
  } else if (req.method === "GET") {
    // List all feedback
    try {
      const feedback = await getAllFeedback();
      return res.status(200).json({ feedback });
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
} 