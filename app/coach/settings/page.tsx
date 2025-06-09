"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CoachSettingsPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto">
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
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full">Delete Account</Button>
          </CardContent>
          <CardFooter>
            <Button className="w-full mt-2">Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 