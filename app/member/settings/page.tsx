"use client";

import { MemberSettings } from "@/components/member-settings";
import { MemberDashboard } from "@/components/member-dashboard";
import { useState } from "react";

export default function SettingsPage() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <MemberDashboard onLogout={() => {}} />;
  }

  return (
    <MemberSettings 
      onBackToDashboard={() => setShowDashboard(true)} 
    />
  );
} 