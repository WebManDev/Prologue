"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Paperclip, Video, Phone, MoreVertical, Star, Calendar, Clock } from "lucide-react"
import { auth, listenForMessages, sendMessage } from "@/lib/firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { getFirestore, collection, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore"
import { Logo } from "@/components/logo"

interface MemberMessagingInterfaceProps {
  coach: any
  onBack: () => void
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var not set');
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function MemberMessagingInterface({ coach, onBack }: MemberMessagingInterfaceProps) {
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Determine roles and IDs
  const currentUser = auth.currentUser
  const isMember = coach && coach.coach
  const memberId = isMember ? currentUser?.uid : coach.id || coach.memberId
  const athleteId = isMember ? coach.id || coach.athleteId : currentUser?.uid
  const senderRole = isMember ? "member" : "coach"
  const senderId = currentUser?.uid
  
  // Check subscription status
  const subscriptionStatus = coach.subscriptionStatus || 'active'
  const isSubscriptionActive = subscriptionStatus === 'active'

  useEffect(() => {
    if (!memberId || !athleteId) return
    const unsubscribe = listenForMessages({
      memberId,
      athleteId,
      callback: (msgs) => {
        setMessages(msgs)
        setLoading(false)
      },
    })
    return () => unsubscribe && unsubscribe()
  }, [memberId, athleteId])

  const handleSend = async () => {
    if (!message.trim() || !memberId || !athleteId || !senderId) return
    
    // Prevent sending messages if subscription is inactive
    if (!isSubscriptionActive) {
      alert("Cannot send messages - subscription has expired. Please resubscribe to continue messaging.")
      return
    }
    
    await sendMessage({
      memberId,
      athleteId,
      senderId,
      senderRole,
      content: message.trim(),
    })
    setMessage("")
  }

  const handleSubmit = async () => {
    if (!videoFile) {
      alert("Please select a video file.");
      return;
    }
    if (!feedbackText.trim()) {
      alert("Please enter feedback details.");
      return;
    }
    
    // Prevent feedback submission if subscription is inactive
    if (!isSubscriptionActive) {
      alert("Cannot submit new feedback requests - subscription has expired. Please resubscribe to continue using feedback services.")
      return
    }
    
    setIsUploading(true);
    try {
      const userId = auth.currentUser?.uid;
      const coachId = coach.id || coach.athleteId;
      const storage = getStorage();
      const storageRef = ref(storage, `video-feedback/${userId}/${Date.now()}_${videoFile.name}`);
      await uploadBytes(storageRef, videoFile);
      const downloadURL = await getDownloadURL(storageRef);
      const db = getFirestore();
      await addDoc(collection(db, "videoFeedbackRequests"), {
        userId,
        coachId,
        videoUrl: downloadURL,
        feedbackText,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      // Update athlete's profile
      await updateDoc(doc(db, "athletes", coachId), {
        feedbacks: increment(1)
      });
      alert("It's successful!");
      setVideoFile(null);
      setFeedbackText("");
    } catch (error) {
      alert("Upload failed: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendImage = async (file: File) => {
    if (!file || !memberId || !athleteId || !senderId) return;
    setIsUploadingImage(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `chat-images/${senderId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await sendMessage({
        memberId,
        athleteId,
        senderId,
        senderRole,
        content: downloadURL,
        type: "image"
      });
      setImageFile(null);
    } catch (error) {
      alert("Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const coachInfo = {
    name: coach.coach || coach.name,
    sport: coach.sport || "Tennis",
    rating: 4.9,
    students: 128,
    responseTime: "Usually responds within 2 hours",
    specialties: ["Serve Technique", "Mental Game", "Competition Prep"],
    availability: "Mon-Fri 9AM-6PM EST",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo />
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
            <div className="flex items-center space-x-3">
              <img
                src={coach.coachAvatar || coach.avatar || "/placeholder.svg"}
                alt={coachInfo.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{coachInfo.name}</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{coachInfo.sport}</Badge>
                  {isSubscriptionActive ? (
                    <span className="text-sm text-green-600">Active Subscription</span>
                  ) : (
                    <span className="text-sm text-orange-600">Subscription Expired</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Subscription Status Warning */}
        {!isSubscriptionActive && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-orange-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-800">Subscription Expired</h3>
                <p className="text-sm text-orange-700">
                  You can view your message history and past feedback, but cannot send new messages or submit new feedback requests. 
                  <a href="/member-browse" className="underline ml-1">Resubscribe to restore full access</a>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col flex-1 h-full sm:h-[600px] min-h-[700px]">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`pb-2 px-1 border-b-2 transition-colors ${
                        activeTab === "chat"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setActiveTab("feedback")}
                      className={`pb-2 px-1 border-b-2 transition-colors ${
                        activeTab === "feedback"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Video Feedback
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              {activeTab === "chat" && (
                <>
                  <CardContent className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                            {msg.senderId !== auth.currentUser?.uid && (
                              <img
                                src={coach.coachAvatar || coach.avatar || "/placeholder.svg"}
                                alt={coachInfo.name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                msg.senderId === auth.currentUser?.uid ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              {msg.type === "image" ? (
                                <img src={msg.content} alt="sent image" className="max-w-[200px] max-h-[200px] rounded-lg" />
                              ) : (
                                <p className="text-sm">{msg.content}</p>
                              )}
                              <p
                                className={`text-xs mt-1 ${
                                  msg.senderId === auth.currentUser?.uid ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <label>
                        <Button variant="ghost" size="sm" asChild>
                          <span><Paperclip className="h-4 w-4" /></span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                              handleSendImage(e.target.files[0]);
                            }
                          }}
                          disabled={isUploadingImage}
                        />
                      </label>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSend()
                          }
                        }}
                        disabled={!isSubscriptionActive}
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSend} disabled={isUploadingImage || !isSubscriptionActive}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Video Feedback Tab */}
              {activeTab === "feedback" && (
                <CardContent className="flex-1 flex flex-col p-6 sm:h-[600px]">
                  <div className="space-y-3 sm:space-y-6 flex-1 flex flex-col sm:h-full">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Video Feedback</h3>
                      <p className="text-gray-600">
                        Upload a video and get personalized feedback from {coachInfo.name}
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg py-12 px-4 sm:p-8 text-center w-full max-w-full mx-auto flex flex-col justify-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Upload Training Video</p>
                      <p className="text-sm text-gray-600">MP4, MOV, AVI up to 100MB</p>
                      <input
                        type="file"
                        accept="video/*"
                        style={{ display: "none" }}
                        id="video-upload"
                        onChange={e => setVideoFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="video-upload" className="block w-full">
                        <Button className="mt-4 w-full" asChild>
                          <span>{videoFile ? videoFile.name : "Choose File"}</span>
                        </Button>
                      </label>
                    </div>
                    <div className="mt-6 w-full text-left">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like feedback on?
                      </label>
                      <Textarea
                        placeholder="Describe what you're working on and specific areas you'd like feedback on..."
                        rows={4}
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        disabled={!isSubscriptionActive}
                      />
                    </div>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 mt-6"
                      onClick={handleSubmit}
                      disabled={isUploading || !videoFile || !feedbackText.trim() || !isSubscriptionActive}
                    >
                      {isUploading ? "Uploading..." : "Submit for Feedback"}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
