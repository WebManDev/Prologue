"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useUnifiedLogout } from "@/hooks/use-unified-logout"

export default function AdminDashboard() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [loadingFeedback, setLoadingFeedback] = useState(true)
  const [loadingUpdates, setLoadingUpdates] = useState(true)
  const [responding, setResponding] = useState<string | null>(null)
  const [responseText, setResponseText] = useState("")
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")
  const [sendingUpdate, setSendingUpdate] = useState(false)
  const { logout } = useUnifiedLogout()

  // Fetch feedback
  useEffect(() => {
    setLoadingFeedback(true)
    fetch("/api/platform-feedback")
      .then(res => res.json())
      .then(data => setFeedback(data.feedback || []))
      .finally(() => setLoadingFeedback(false))
  }, [])

  // Fetch updates
  useEffect(() => {
    setLoadingUpdates(true)
    fetch("/api/platform-updates")
      .then(res => res.json())
      .then(data => setUpdates(data.updates || []))
      .finally(() => setLoadingUpdates(false))
  }, [])

  // Respond to feedback
  const handleRespond = async (id: string) => {
    setResponding(id)
    await fetch("/api/platform-feedback-respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedbackId: id, response: responseText }),
    })
    setFeedback(fb => fb.map(f => f.id === id ? { ...f, response: responseText, status: "responded" } : f))
    setResponding(null)
    setResponseText("")
  }

  // Send update
  const handleSendUpdate = async () => {
    setSendingUpdate(true)
    await fetch("/api/platform-updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: updateTitle, message: updateMessage, createdBy: "admin" }),
    })
    setUpdateTitle("")
    setUpdateMessage("")
    // Refresh updates
    fetch("/api/platform-updates")
      .then(res => res.json())
      .then(data => setUpdates(data.updates || []))
    setSendingUpdate(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-lg bg-gray-200" />
            <div>
              <div className="h-6 w-48 mb-2 bg-gray-200 rounded" />
              <div className="h-4 w-64 bg-gray-100 rounded" />
            </div>
          </div>
          <Button onClick={() => logout({ onComplete: () => window.location.href = "/" })}>
            Log out
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feedback Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">User Feedback</span>
                </div>
                <span className="text-gray-500 text-sm">View and respond to platform feedback</span>
              </CardHeader>
              <CardContent>
                {loadingFeedback ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                ) : feedback.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No feedback yet.</div>
                ) : (
                  <div className="space-y-4">
                    {feedback.map(fb => {
                      const isResponding = responding === fb.id;
                      const isDisabled = Boolean((responding && responding !== fb.id) || !responseText || isResponding);
                      return (
                        <div key={fb.id} className="border border-gray-200 rounded-lg p-4 space-y-2 bg-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{fb.title}</div>
                              <div className="text-gray-500 text-sm">{fb.type}</div>
                              <div className="text-gray-700 mt-1">{fb.message}</div>
                              <div className="text-xs text-gray-400 mt-1">{new Date(fb.createdAt?.seconds ? fb.createdAt.seconds * 1000 : Date.now()).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${fb.status === "responded" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{fb.status || "new"}</span>
                            </div>
                          </div>
                          {fb.status !== "responded" ? (
                            <div className="mt-2 flex items-center space-x-2">
                              <Textarea
                                value={isResponding ? responseText : ""}
                                onChange={e => setResponseText(e.target.value)}
                                placeholder="Write a response..."
                                rows={2}
                                className="w-full"
                                disabled={!!(responding && responding !== fb.id)}
                              />
                              <Button
                                onClick={() => handleRespond(fb.id)}
                                disabled={isDisabled}
                              >
                                {isResponding ? <span className="animate-spin mr-2">⏳</span> : null} Respond
                              </Button>
                            </div>
                          ) : (
                            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
                              <div className="text-xs text-green-700 font-semibold mb-1">Admin Response:</div>
                              <div className="text-sm">{fb.response}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Updates Section */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">Send Update</span>
                </div>
                <span className="text-gray-500 text-sm">Send an announcement to all users</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={updateTitle}
                  onChange={e => setUpdateTitle(e.target.value)}
                  placeholder="Update title"
                  className="w-full"
                />
                <Textarea
                  value={updateMessage}
                  onChange={e => setUpdateMessage(e.target.value)}
                  placeholder="Write your update..."
                  rows={4}
                  className="w-full"
                />
                <Button
                  onClick={handleSendUpdate}
                  disabled={!updateTitle || !updateMessage || sendingUpdate}
                  className="w-full"
                >
                  {sendingUpdate ? <span className="animate-spin mr-2">⏳</span> : null} Send Update
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">Past Updates</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingUpdates ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full rounded" />
                    ))}
                  </div>
                ) : updates.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No updates yet.</div>
                ) : (
                  <div className="space-y-2">
                    {updates.map(upd => (
                      <div key={upd.id} className="border border-gray-200 rounded p-2 bg-white">
                        <div className="font-semibold">{upd.title}</div>
                        <div className="text-gray-700 text-sm">{upd.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(upd.createdAt?.seconds ? upd.createdAt.seconds * 1000 : Date.now()).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
