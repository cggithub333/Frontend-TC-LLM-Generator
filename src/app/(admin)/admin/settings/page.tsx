"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Save,
  Globe,
  Shield,
  Bell,
  Upload,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  // General settings
  const [platformName, setPlatformName] = useState("QuraEx");
  const [platformDesc, setPlatformDesc] = useState(
    "AI-powered test case generation platform for QA teams"
  );
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("asia_hcm");

  // Security settings
  const [googleOAuth, setGoogleOAuth] = useState(true);
  const [emailPassword, setEmailPassword] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24");

  // Notification settings
  const [welcomeEmails, setWelcomeEmails] = useState(true);
  const [subscriptionReminders, setSubscriptionReminders] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-card px-8 py-5 shrink-0">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            className="gap-2"
            disabled={saved}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
          {/* General Settings */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Globe className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold">General Settings</h2>
                <p className="text-xs text-muted-foreground">
                  Basic platform configuration
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Platform Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label htmlFor="platform-name" className="text-sm font-medium">
                    Platform Name
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Displayed in the sidebar and browser tab
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Input
                    id="platform-name"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Platform Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label htmlFor="platform-desc" className="text-sm font-medium">
                    Platform Description
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Short description shown on login and public pages
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Textarea
                    id="platform-desc"
                    value={platformDesc}
                    onChange={(e) => setPlatformDesc(e.target.value)}
                    rows={3}
                    className="max-w-md resize-none"
                  />
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Language */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label className="text-sm font-medium">Default Language</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Primary language for the platform UI
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="max-w-md w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Timezone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label className="text-sm font-medium">Default Timezone</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used for scheduling and display purposes
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="max-w-md w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia_hcm">
                        (UTC+7) Asia/Ho_Chi_Minh
                      </SelectItem>
                      <SelectItem value="asia_tokyo">
                        (UTC+9) Asia/Tokyo
                      </SelectItem>
                      <SelectItem value="us_pacific">
                        (UTC-8) America/Los_Angeles
                      </SelectItem>
                      <SelectItem value="us_eastern">
                        (UTC-5) America/New_York
                      </SelectItem>
                      <SelectItem value="europe_london">
                        (UTC+0) Europe/London
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Logo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label className="text-sm font-medium">Platform Logo</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recommended size: 512×512px, PNG or SVG
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="max-w-md border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Drop your logo here or{" "}
                        <span className="text-primary">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, SVG up to 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Shield className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  Security & Authentication
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage sign-in methods and security policies
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Google OAuth */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Google OAuth</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Allow users to sign in with Google
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={googleOAuth}
                    onCheckedChange={setGoogleOAuth}
                  />
                  <span className="text-sm text-muted-foreground">
                    {googleOAuth ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Email/Password */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">
                    Email / Password Login
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Traditional email and password authentication
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={emailPassword}
                    onCheckedChange={setEmailPassword}
                  />
                  <span className="text-sm text-muted-foreground">
                    {emailPassword ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* 2FA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">
                    Require 2FA for Admins
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enforce two-factor authentication for admin accounts
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={require2FA}
                    onCheckedChange={setRequire2FA}
                  />
                  <span className="text-sm text-muted-foreground">
                    {require2FA ? "Required" : "Optional"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Session Timeout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label className="text-sm font-medium">Session Timeout</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Auto-logout inactive users after this duration
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-24"
                    min={1}
                    max={720}
                  />
                  <span className="text-sm text-muted-foreground">hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email & Notifications */}
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Bell className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  Email & Notifications
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure automated emails and alert preferences
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Welcome Emails */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Welcome Emails</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Send a welcome email when new users register
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={welcomeEmails}
                    onCheckedChange={setWelcomeEmails}
                  />
                  <span className="text-sm text-muted-foreground">
                    {welcomeEmails ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Subscription Reminders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">
                    Subscription Reminders
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remind users before subscription renewal or expiry
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={subscriptionReminders}
                    onCheckedChange={setSubscriptionReminders}
                  />
                  <span className="text-sm text-muted-foreground">
                    {subscriptionReminders ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Usage Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Usage Alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Alert admins when usage limits are approaching
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={usageAlerts}
                    onCheckedChange={setUsageAlerts}
                  />
                  <span className="text-sm text-muted-foreground">
                    {usageAlerts ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Security Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Security Alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Notify admins of suspicious login attempts
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={securityAlerts}
                    onCheckedChange={setSecurityAlerts}
                  />
                  <span className="text-sm text-muted-foreground">
                    {securityAlerts ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Weekly Reports */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Send weekly platform analytics summary to admins
                  </p>
                </div>
                <div className="md:col-span-2 flex items-center gap-3">
                  <Switch
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                  />
                  <span className="text-sm text-muted-foreground">
                    {weeklyReports ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200 dark:border-red-900/50">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Settings className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-red-700 dark:text-red-400">
                  Danger Zone
                </h2>
                <p className="text-xs text-muted-foreground">
                  Irreversible and destructive actions
                </p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Reset Platform */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">
                    Reset All Settings
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Restore all settings to their default values
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20">
                    Reset to Defaults
                  </Button>
                </div>
              </div>

              <div className="h-px bg-red-100 dark:bg-red-900/30" />

              {/* Clear Cache */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <Label className="text-sm font-medium">Clear System Cache</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clear all cached data across the platform
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20">
                    Clear Cache
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
