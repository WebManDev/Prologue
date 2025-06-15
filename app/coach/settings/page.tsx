"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { CreditCard, MessageSquare, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CoachStripeOnboarding } from "@/components/coach-stripe-onboarding";
import { db } from "@/lib/firebase";

export default function CoachSettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  async function deleteCoachAccount() {
    if (!auth.currentUser) return alert("Not logged in!");
    setDeleting(true);
    const userId = auth.currentUser.uid;
    try {
      // Delete all posts
      const postsQuery = query(collection(db, "athletePosts"), where("userId", "==", userId));
      const postsSnap = await getDocs(postsQuery);
      for (const postDoc of postsSnap.docs) {
        await deleteDoc(doc(db, "athletePosts", postDoc.id));
      }
      // Delete profile
      await deleteDoc(doc(db, "athletes", userId));
      // Delete user from Auth
      await auth.currentUser.delete();
      // Redirect to home
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Failed to delete account. Please re-authenticate and try again.");
    } finally {
      setDeleting(false);
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => router.push('/coach/dashboard')}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" />
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-email">Email Notifications</Label>
              <Switch id="notif-email" checked={notifications.email} onCheckedChange={v => setNotifications(n => ({ ...n, email: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-sms">SMS Notifications</Label>
              <Switch id="notif-sms" checked={notifications.sms} onCheckedChange={v => setNotifications(n => ({ ...n, sms: v }))} />
            </div>
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account & Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full" disabled={deleting}
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                  await deleteCoachAccount();
                }
              }}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
            <Button className="w-full mt-2" onClick={handleSave}>Save Changes</Button>
            {saved && <div className="text-green-600 text-center w-full mt-2">Changes saved.</div>}
            <div className="space-y-3 mt-6">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowPaymentModal(true)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Settings</DialogTitle>
            <DialogDescription>
              Enter your bank account information to receive payouts directly. Your information is securely processed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <BankInfoForm
              coachName={name}
              coachEmail={email}
              onSuccess={() => setShowPaymentModal(false)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BankInfoForm({ coachName, coachEmail, onSuccess }: { coachName: string, coachEmail: string, onSuccess: () => void }) {
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Get the current user ID (coach)
      const user = auth.currentUser;
      if (!user) {
        setMessage("You must be logged in.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/stripe/setup-athlete-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: user.uid,
          accountNumber,
          routingNumber,
          accountHolderName: coachName || coachEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Bank account setup successful!");
        setTimeout(() => {
          setMessage("");
          onSuccess();
        }, 1500);
      } else {
        setMessage(data.error || "Failed to set up bank account");
      }
    } catch (err: any) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Routing Number</Label>
        <Input
          type="text"
          value={routingNumber}
          onChange={e => setRoutingNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Account Number</Label>
        <Input
          type="text"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Bank Info"}
      </Button>
      {message && <div className="text-center text-sm mt-2">{message}</div>}
    </form>
  );
} 