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

interface MemberMessagingInterfaceProps {
  coach: any
  onBack: () => void
}

const STRIPE_PUBLISHABLE_KEY = "pk_test_51RTKV905oLGlYeZ0j3Dl8jKIYNYIFU1kuNMLZhvXECRhTVNIqdAHQTe5Dq5AEZ0eVMI7HRyopowo34ZAtFWp8V9H00pznHlYqu";

export function MemberMessagingInterface({ coach, onBack }: MemberMessagingInterfaceProps) {
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Determine roles and IDs
  const currentUser = auth.currentUser
  const isMember = coach && coach.coach
  const memberId = isMember ? currentUser?.uid : coach.id || coach.memberId
  const athleteId = isMember ? coach.id || coach.athleteId : currentUser?.uid
  const senderRole = isMember ? "member" : "coach"
  const senderId = currentUser?.uid

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
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Voice Call
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
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
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className={`pb-2 px-1 border-b-2 transition-colors ${
                        activeTab === "schedule"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Schedule Session
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
                              <p className="text-sm">{msg.content}</p>
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
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
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
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSend}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Video Feedback Tab */}
              {activeTab === "feedback" && (
                <CardContent className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Video Feedback</h3>
                      <p className="text-gray-600">
                        Upload a video and get personalized feedback from {coachInfo.name}
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                      <label htmlFor="video-upload">
                        <Button className="mt-4" asChild>
                          <span>{videoFile ? videoFile.name : "Choose File"}</span>
                        </Button>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like feedback on?
                      </label>
                      <Textarea
                        placeholder="Describe what you're working on and specific areas you'd like feedback on..."
                        rows={4}
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      onClick={handleSubmit}
                      disabled={isUploading}
                    >
                      {isUploading ? "Uploading..." : "Submit for Feedback"}
                    </Button>
                  </div>
                </CardContent>
              )}

              {/* Schedule Session Tab */}
              {activeTab === "schedule" && (
                <CardContent className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule 1-on-1 Session</h3>
                      <p className="text-gray-600">Book a private session with {coachInfo.name}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Session Types</h4>
                        <div className="space-y-3">
                          {[
                            { type: "Video Analysis", duration: "30 min", price: "$49" },
                            { type: "Live Training", duration: "60 min", price: "$89" },
                            { type: "Strategy Session", duration: "45 min", price: "$69" },
                          ].map((session, index) => (
                            <div key={index} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{session.type}</div>
                                  <div className="text-sm text-gray-600">{session.duration}</div>
                                </div>
                                <div className="font-bold text-green-600">{session.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Available Times</h4>
                        <div className="space-y-2">
                          {[
                            "Today 2:00 PM",
                            "Tomorrow 10:00 AM",
                            "Tomorrow 3:00 PM",
                            "Friday 11:00 AM",
                            "Friday 4:00 PM",
                          ].map((time, index) => (
                            <button
                              key={index}
                              className="w-full text-left p-2 border rounded hover:bg-blue-50 hover:border-blue-200"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Coach Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coach Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <img
                    src={coach.coachAvatar || coach.avatar || "/placeholder.svg"}
                    alt={coachInfo.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3"
                  />
                  <h3 className="font-semibold text-lg">{coachInfo.name}</h3>
                  <p className="text-gray-600">{coachInfo.sport} Specialist</p>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{coachInfo.rating}</span>
                    <span className="text-gray-600">({coachInfo.students} students)</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {coachInfo.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{coachInfo.availability}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{coachInfo.responseTime}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      video: "Serve Practice #3",
                      rating: 4.5,
                      date: "2 days ago",
                    },
                    {
                      video: "Forehand Drill",
                      rating: 4.0,
                      date: "1 week ago",
                    },
                  ].map((feedback, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{feedback.video}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{feedback.rating}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{feedback.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
