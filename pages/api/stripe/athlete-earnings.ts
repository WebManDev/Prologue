import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    monthlyEarnings: 470,
    totalEarnings: 2350,
    activeSubscriptions: 47,
    subscribers: 47,
    totalPosts: 23,
    totalViews: 1240,
  })
} 