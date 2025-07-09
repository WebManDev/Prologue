"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface FeedbackRequest {
  id: string
  title: string
  description: string
  category: string
  status: "active" | "completed"
  videoUrl?: string
  createdAt: string
  completedAt?: string
  userRating?: number
  userComment?: string
}

interface FeedbackDialogProps {
  request: FeedbackRequest
  rating: number
  comment: string
  onRatingChange: (rating: number) => void
  onCommentChange: (comment: string) => void
  onSubmit: () => void
  onClose: () => void
}

export default function FeedbackDialog({
  request,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSubmit,
  onClose,
}: FeedbackDialogProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Feedback</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate this content
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onRatingChange(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your feedback (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Share your thoughts about this content..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={rating === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 