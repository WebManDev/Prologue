import React, { useState, useEffect, useRef } from "react"
import { User, Heart, MessageCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  createdBy?: string
  editedAt?: Date
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onAddComment: (postId: string, content: string, parentId?: string) => void
  onLikeComment: (commentId: string) => void
  onEditComment: (commentId: string, newContent: string) => void
  onDeleteComment: (commentId: string) => void
  currentUserId?: string
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, onAddComment, onLikeComment, onEditComment, onDeleteComment, currentUserId }) => {
  const [commentInput, setCommentInput] = useState("")
  const [replyInput, setReplyInput] = useState<{ [key: string]: string }>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editInput, setEditInput] = useState<{ [key: string]: string }>({})
  const [profileCache, setProfileCache] = useState<Record<string, any>>({});

  // Add this line to fix the linter error
  const replyInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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

  // Helper to build nested comment tree
  function buildCommentTree(comments: Comment[]): Comment[] {
    const commentMap: { [id: string]: Comment & { replies: Comment[] } } = {};
    const roots: Comment[] = [];
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });
    comments.forEach(comment => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].replies.push(commentMap[comment.id]);
        }
      } else {
        roots.push(commentMap[comment.id]);
      }
    });
    return roots;
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

  const handleEditComment = (commentId: string, e: React.FormEvent) => {
    e.preventDefault()
    if (editInput[commentId]?.trim()) {
      onEditComment(commentId, editInput[commentId])
      setEditInput((prev) => ({ ...prev, [commentId]: "" }))
      setEditingComment(null)
    }
  }

  const handleStartEdit = (commentId: string, currentContent: string) => {
    setEditingComment(commentId)
    setEditInput((prev) => ({ ...prev, [commentId]: currentContent }))
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
    setEditInput({})
  }

  // Enhanced renderComment to support deeper nesting
  const renderComment = (comment: Comment, level = 0) => (
    <div key={comment.id} className={`flex items-start space-x-3 ${level > 0 ? `ml-[${Math.min(level * 16, 64)}px] border-l-2 border-gray-200 pl-4` : "mt-4"}`}>
      <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
        {(() => {
          const profile = profileCache[comment.createdBy as string] || {};
          const profileImageUrl = comment.userAvatar || profile.profileImageUrl || profile.profilePic || profile.profilePicture;
          
          if (profileImageUrl) {
            return <Image src={profileImageUrl} alt={getDisplayName(comment)} width={36} height={36} />;
          } else {
            return <User className="w-full h-full text-gray-500 p-2" />;
          }
        })()}
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
        {editingComment === comment.id ? (
          <form className="mt-2 flex items-center space-x-2" onSubmit={(e) => handleEditComment(comment.id, e)}>
            <input
              type="text"
              className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-prologue-electric/20"
              placeholder="Edit your comment..."
              value={editInput[comment.id] || ""}
              onChange={e => setEditInput(prev => ({ ...prev, [comment.id]: e.target.value }))}
            />
            <Button type="submit" size="sm" className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white">Save</Button>
            <Button type="button" size="sm" variant="outline" className="px-3 py-1 text-xs" onClick={handleCancelEdit}>Cancel</Button>
          </form>
        ) : (
          <div className="text-gray-800 text-sm mb-1 whitespace-pre-line">
            {comment.content}
            {comment.editedAt && (
              <span className="text-xs text-gray-500 ml-2">(edited)</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <button
              className={`flex items-center space-x-1 ${comment.isLiked ? "text-red-500" : "hover:text-red-500"}`}
              onClick={() => onLikeComment(comment.id)}
              type="button"
            >
              <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current text-red-500" : ""}`} />
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
          {currentUserId && comment.createdBy === currentUserId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-gray-100">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStartEdit(comment.id, comment.content)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteComment(comment.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              ref={el => { replyInputRefs.current[comment.id] = el; }}
            />
            <Button type="submit" size="sm" className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white">Post</Button>
          </form>
        )}
        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => renderComment(reply, level + 1))}
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
          buildCommentTree(comments).map(comment => renderComment(comment, 0))
        )}
      </div>
      <form className="flex items-center space-x-2" onSubmit={handleAddComment}>
        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          {(() => {
            // Always use the current user's profile image if available
            let profileImageUrl = undefined;
            if (currentUserId && profileCache[currentUserId]) {
              const profile = profileCache[currentUserId];
              profileImageUrl = profile.profileImageUrl || profile.profilePic || profile.profilePicture;
            }
            if (profileImageUrl) {
              return <Image src={profileImageUrl} alt="Your profile" width={32} height={32} />;
            } else {
              return <User className="w-full h-full text-gray-500 p-1.5" />;
            }
          })()}
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