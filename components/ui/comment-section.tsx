import React, { useState, useEffect } from "react"
import { User, Heart, MessageCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { getMemberProfile, getAthleteProfile } from "@/lib/firebase";

interface Comment {
  id: string
  userId: string
  userAvatar: string
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
  replies: Comment[]
  parentId?: string
  createdBy?: string;
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onAddComment: (postId: string, content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onAddComment, onLikeComment }) => {
  const [commentInput, setCommentInput] = useState("")
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [profileCache, setProfileCache] = useState<Record<string, any>>({});

  // Fetch missing profiles for all unique createdBy in comments and replies
  useEffect(() => {
    function collectUserIds(comments: Comment[]): string[] {
      let ids: string[] = [];
      for (const c of comments) {
        if (typeof c.createdBy === 'string') ids.push(c.createdBy);
        if (c.replies && c.replies.length) ids = ids.concat(collectUserIds(c.replies));
      }
      return ids;
    }
    const allUserIds = collectUserIds(comments).filter(Boolean);
    const uniqueUserIds = Array.from(new Set(allUserIds)).filter(uid => !profileCache[uid]);
    uniqueUserIds.forEach(async (uid) => {
      let profile = await getMemberProfile(uid);
      if (!profile) {
        profile = await getAthleteProfile(uid);
      }
      setProfileCache(prev => ({ ...prev, [uid]: profile }));
    });
  }, [comments]);

  function getDisplayName(comment: Comment) {
    const profile = profileCache[comment.createdBy as string] || {};
    const firstName = profile.firstName && typeof profile.firstName === 'string' ? profile.firstName : '';
    const lastName = profile.lastName && typeof profile.lastName === 'string' ? profile.lastName : '';
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }
    if (profile.name && typeof profile.name === 'string') {
      return profile.name;
    }
    if (comment.createdBy && typeof comment.createdBy === 'string') {
      return comment.createdBy;
    }
    return 'User';
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (commentInput.trim()) {
      onAddComment(postId, commentInput)
      setCommentInput("")
    }
  }

  const handleAddReply = (parentId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (replyInput[parentId]?.trim()) {
      onAddComment(postId, replyInput[parentId], parentId)
      setReplyInput((prev) => ({ ...prev, [parentId]: "" }))
      setReplyingTo(null)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex items-start space-x-3 ${isReply ? "ml-8 mt-2" : "mt-4"}`}>
      <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
        {comment.userAvatar ? (
          <Image src={comment.userAvatar} alt={getDisplayName(comment)} width={36} height={36} />
        ) : (
          <User className="w-full h-full text-gray-500 p-2" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          {/* Only show name if at least one of first or last is valid */}
          {(() => {
            const profile = profileCache[comment.createdBy as string] || {};
            const firstName = profile.firstName && typeof profile.firstName === 'string' ? profile.firstName : '';
            const lastName = profile.lastName && typeof profile.lastName === 'string' ? profile.lastName : '';
            if (firstName || lastName) {
              return <span className="font-semibold text-gray-900 text-sm">{`${firstName}${firstName && lastName ? ' ' : ''}${lastName}`}</span>;
            }
            return null;
          })()}
          {/* Removed time-ago display */}
        </div>
        <div className="text-gray-800 text-sm mb-1 whitespace-pre-line">{comment.content}</div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <button
            className={`flex items-center space-x-1 ${comment.isLiked ? "text-prologue-electric" : "hover:text-prologue-electric"}`}
            onClick={() => onLikeComment(comment.id)}
            type="button"
          >
            <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`} />
            <span>{comment.likes}</span>
          </button>
          <button
            className="hover:text-prologue-electric"
            onClick={() => setReplyingTo(comment.id)}
            type="button"
          >
            Reply
          </button>
        </div>
        {/* Reply input */}
        {replyingTo === comment.id && (
          <form className="mt-2 flex items-center space-x-2" onSubmit={(e) => handleAddReply(comment.id, e)}>
            <input
              type="text"
              className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
              placeholder="Add a reply..."
              value={replyInput[comment.id] || ""}
              onChange={e => setReplyInput(prev => ({ ...prev, [comment.id]: e.target.value }))}
            />
            <Button type="submit" size="sm" className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white">Post</Button>
          </form>
        )}
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-4">
        {comments.length === 0 ? (
          <div className="text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
      <form className="flex items-center space-x-2" onSubmit={handleAddComment}>
        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <User className="w-full h-full text-gray-500 p-1.5" />
        </div>
        <input
          type="text"
          className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={e => setCommentInput(e.target.value)}
        />
        <Button type="submit" size="sm" className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white">Post</Button>
      </form>
    </div>
  )
}

export default CommentSection 