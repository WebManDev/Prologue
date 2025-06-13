"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { auth, db, getMemberProfile, getAthletesByIds } from "@/lib/firebase";
import { collection, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export function MemberSettings({ onBackToDashboard }: { onBackToDashboard: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<{ [athleteId: string]: string }>({});
  const [subscriptionDates, setSubscriptionDates] = useState<{ [athleteId: string]: string }>({});
  const [loadingPortal, setLoadingPortal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMemberProfileAndSubs() {
      if (!auth.currentUser) return;
      const userId = auth.currentUser.uid;
      const member = await getMemberProfile(userId);
      if (member) {
        setName(member.name || "");
        setEmail(member.email || "");
        setNotifications({
          email: member.notifications?.email ?? true,
          sms: member.notifications?.sms ?? false,
        });
        setSubscriptionPlans(member.subscriptionPlans || {});
        setSubscriptionDates(member.subscriptionDates || {});
        if (Array.isArray(member.subscriptions) && member.subscriptions.length > 0) {
          const athletes = await getAthletesByIds(member.subscriptions);
          setSubscriptions(athletes);
        } else {
          setSubscriptions([]);
        }
      }
    }
    fetchMemberProfileAndSubs();
  }, []);

  async function handleSave() {
    if (!auth.currentUser) return alert("Not logged in!");
    const userId = auth.currentUser.uid;
    const memberRef = doc(db, "members", userId);
    await updateDoc(memberRef, {
      name,
      email,
      notifications,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (onBackToDashboard) onBackToDashboard();
  }

  async function deleteMemberAccount() {
    if (!auth.currentUser) return alert("Not logged in!");
    setDeleting(true);
    const userId = auth.currentUser.uid;
    try {
      await deleteDoc(doc(db, "members", userId));
      await auth.currentUser.delete();
      if (onBackToDashboard) onBackToDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to delete account. Please re-authenticate and try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleManagePayment(athleteId: string) {
    setLoadingPortal(athleteId);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Not authenticated");
      }

      const res = await fetch("/api/stripe/create-customer-portal", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ athleteId }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.url) {
        throw new Error("No portal URL received");
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error("Error opening payment portal:", err);
      alert(err.message || "Failed to open payment portal. Please try again later.");
    } finally {
      setLoadingPortal(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={onBackToDashboard}>
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="text-gray-500">You have no active subscriptions.</div>
            ) : (
              subscriptions.map((athlete) => (
                <div key={athlete.id} className="flex flex-col md:flex-row md:items-center md:justify-between border-b py-3 last:border-b-0">
                  <div>
                    <div className="font-semibold">{athlete.name}</div>
                    <div className="text-sm text-gray-600">{athlete.sport}</div>
                    <div className="text-xs text-gray-500">Plan: {subscriptionPlans[athlete.id]?.charAt(0).toUpperCase() + subscriptionPlans[athlete.id]?.slice(1)}</div>
                    <div className="text-xs text-gray-400">Started: {subscriptionDates[athlete.id] ? new Date(subscriptionDates[athlete.id]).toLocaleDateString() : "-"}</div>
                  </div>
                  <Button
                    className="mt-2 md:mt-0"
                    variant="outline"
                    onClick={() => handleManagePayment(athlete.id)}
                    disabled={loadingPortal === athlete.id}
                  >
                    {loadingPortal === athlete.id ? "Loading..." : "Manage Payment"}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
                  await deleteMemberAccount();
                }
              }}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
            <Button className="w-full mt-2" onClick={handleSave}>Save Changes</Button>
            {saved && <div className="text-green-600 text-center w-full mt-2">Changes saved.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 