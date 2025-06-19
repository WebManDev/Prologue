"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Video, ImageIcon, ArrowLeft, Save, X } from "lucide-react"
import { auth, getAthleteProfile, updateAthletePost, deleteAthletePost } from "@/lib/firebase"
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { Logo } from "@/components/logo"

interface PostData {
  title: string;
  content: string;
  description?: string;
  videoLink?: string;
  type: "blog" | "workout" | "community";
  images?: string[];
  visibility: "public" | "subscribers";
  tags: string[];
  userId: string;
  createdAt: any;
  views?: number;
  likes?: number;
  comments?: number;
}

interface PostUpdate {
  title?: string;
  content?: string;
  description?: string;
  videoLink?: string;
  type?: "blog" | "workout" | "community";
  images?: string[];
  visibility?: "public" | "subscribers";
  tags?: string[];
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string
  
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [editedPost, setEditedPost] = useState<PostData>({
    title: "",
    description: "",
    content: "",
    videoLink: "",
    type: "community",
    images: [],
    visibility: "public",
    tags: [],
    userId: "",
    createdAt: null,
  })
  
  const [workoutVideo, setWorkoutVideo] = useState<File | null>(null)
  const [postImages, setPostImages] = useState<File[]>([])
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const db = getFirestore()

  useEffect(() => {
    const fetchPost = async () => {
      if (!auth.currentUser || !postId) return
      
      try {
        setLoading(true)
        const postRef = doc(db, "athletePosts", postId)
        const postSnap = await getDoc(postRef)
        
        if (!postSnap.exists()) {
          setError("Post not found")
          return
        }
        
        const postData = postSnap.data() as PostData
        
        // Check if the current user owns this post
        if (postData.userId !== auth.currentUser.uid) {
          setError("You don't have permission to edit this post")
          return
        }
        
        setPost(postData)
        setEditedPost({
          title: postData.title,
          description: postData.description || "",
          content: postData.content,
          videoLink: postData.videoLink || "",
          type: postData.type,
          images: postData.images || [],
          visibility: postData.visibility,
          tags: postData.tags || [],
          userId: postData.userId,
          createdAt: postData.createdAt,
        })
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const handleWorkoutVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setWorkoutVideo(file)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!auth.currentUser) return
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Check file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`${file.name} is too large. Max size is 10MB`)
        return false
      }
      return true
    })

    setPostImages(prev => [...prev, ...validFiles])
  }

  const handleUpdatePost = async () => {
    if (!auth.currentUser || !post) return
    
    setSaving(true)
    setIsUploadingVideo(true)
    try {
      let videoUrl = editedPost.videoLink
      
      // Upload new video if one was selected
      if (workoutVideo) {
        const storage = getStorage()
        const fileRef = storageRef(storage, `workout-videos/${auth.currentUser.uid}/${Date.now()}_${workoutVideo.name}`)
        await uploadBytes(fileRef, workoutVideo)
        videoUrl = await getDownloadURL(fileRef)
      }

      // Upload new images if any were selected
      let imageUrls = [...(editedPost.images || [])]
      if (postImages.length > 0) {
        setIsUploadingImages(true)
        const storage = getStorage()
        for (const file of postImages) {
          const fileRef = storageRef(storage, `post-images/${auth.currentUser.uid}/${Date.now()}_${file.name}`)
          await uploadBytes(fileRef, file)
          const url = await getDownloadURL(fileRef)
          imageUrls.push(url)
        }
        setIsUploadingImages(false)
      }

      // Update post in Firebase
      const updates: PostUpdate = {
        title: editedPost.title,
        description: editedPost.description,
        content: editedPost.content,
        videoLink: videoUrl,
        images: imageUrls,
        type: editedPost.type,
        visibility: editedPost.visibility,
        tags: editedPost.tags,
      }
      
      await updateAthletePost(postId, updates)
      
      // Redirect back to dashboard
      router.push('/coach/dashboard?tab=content')
    } catch (error) {
      console.error("Error updating post:", error)
      setError("Failed to update post. Please try again.")
    } finally {
      setSaving(false)
      setIsUploadingVideo(false)
    }
  }

  const handleDeletePost = async () => {
    if (!auth.currentUser || !post) return
    
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }
    
    setDeleting(true)
    try {
      await deleteAthletePost(postId, auth.currentUser.uid)
      router.push('/coach/dashboard?tab=content')
    } catch (error) {
      console.error("Error deleting post:", error)
      setError("Failed to delete post. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/coach/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Post not found</p>
          <Button onClick={() => router.push('/coach/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Button 
            variant="ghost" 
            onClick={() => router.push('/coach/dashboard')}
            className="text-gray-600 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
              <p className="text-gray-600 mt-2">Update your post content and settings</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleDeletePost}
                disabled={deleting}
                className="text-red-600 hover:text-red-700"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Delete Post
              </Button>
              <Button
                onClick={handleUpdatePost}
                disabled={saving || isUploadingVideo || isUploadingImages}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Post</span>
                <div className="flex space-x-2">
                  <Badge variant="outline">
                    {editedPost.type === "workout" ? "Workout" : editedPost.type === "blog" ? "Blog" : "Community"}
                  </Badge>
                  <Badge variant={editedPost.visibility === "public" ? "default" : "outline"}>
                    {editedPost.visibility === "public" ? "Public" : "Subscribers Only"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={editedPost.title}
                  onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={editedPost.description}
                  onChange={(e) => setEditedPost({ ...editedPost, description: e.target.value })}
                  placeholder="Brief description of your post..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <Textarea
                  value={editedPost.content}
                  onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <Input
                  value={editedPost.tags.join(', ')}
                  onChange={(e) => setEditedPost({ 
                    ...editedPost, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., tennis, technique, training"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                      <label>
                        <Video className="h-4 w-4" />
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleWorkoutVideoUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-gray-600">
                      {workoutVideo ? workoutVideo.name : "No new video selected"}
                    </span>
                  </div>
                  {editedPost.videoLink && (
                    <p className="text-xs text-gray-500 mt-1">Current video: {editedPost.videoLink}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 100MB</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="icon" className="shrink-0" asChild>
                      <label>
                        <ImageIcon className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </Button>
                    <span className="text-sm text-gray-600">
                      {postImages.length} new image{postImages.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  {editedPost.images && editedPost.images.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{editedPost.images.length} current images</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB each</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Visibility:</label>
                <select
                  value={editedPost.visibility}
                  onChange={(e) => setEditedPost({ ...editedPost, visibility: e.target.value as "public" | "subscribers" })}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="subscribers">Subscribers Only</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Public posts are visible to everyone, while subscriber-only posts are only visible to your paying subscribers.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push('/coach/dashboard')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePost}
                disabled={saving || isUploadingVideo || isUploadingImages}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 