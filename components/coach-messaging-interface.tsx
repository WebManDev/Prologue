"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Paperclip, MoreVertical } from "lucide-react"
import { auth, listenForMessages, sendMessage } from "@/lib/firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Logo } from "@/components/logo"

interface CoachMessagingInterfaceProps {
  coach: any
  onBack: () => void
}

export function CoachMessagingInterface({ coach, onBack }: CoachMessagingInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Determine roles and IDs
  const currentUser = auth.currentUser
  const memberId = coach.id || coach.memberId
  const athleteId = currentUser?.uid
  const senderRole = "coach"
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
    name: coach.name,
    sport: coach.sport || "Tennis",
    avatar: coach.avatar || coach.coachAvatar || "/placeholder.svg",
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
                src={coachInfo.avatar}
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
                      className={`pb-2 px-1 border-b-2 border-blue-600 text-blue-600`}
                      disabled
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
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
                            src={coachInfo.avatar}
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
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSend} disabled={isUploadingImage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 