import { NextApiRequest, NextApiResponse } from "next";
import { addUpdate, getAllUpdates } from "@/lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Add update
    const { title, message, createdBy } = req.body;
    if (!title || !message || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const docRef = await addUpdate({ title, message, createdBy });
      return res.status(200).json({ success: true, id: docRef.id });
    } catch (e) {
      return res.status(500).json({ error: "Failed to add update" });
    }
  } else if (req.method === "GET") {
    // List all updates
    try {
      const updates = await getAllUpdates();
      return res.status(200).json({ updates });
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch updates" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
} 