"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Users,
  Bot,
  CreditCard,
  Shield,
  Save,
  Upload,
  ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "users", label: "User Management", icon: Users },
  { id: "ai", label: "AI Configurations", icon: Bot },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    workspaceName: "QA Artifacts Production",
    workspaceUrl: "acme-corp",
    timezone: "pst",
    language: "en-us",
    publicLinks: true,
    guestAccess: false,
    weeklyDigest: true,
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b bg-card">
        <h1 className="text-xl font-bold">Admin Settings</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-3">
              <nav className="flex flex-col gap-1 sticky top-6">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Configuration
                </p>
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                      activeTab === tab.id
                        ? "bg-card shadow-sm ring-1 ring-border text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Settings Area */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              {activeTab === "general" && (
                <>
                  {/* Workspace Identity Card */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Workspace Identity</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your workspace branding and basic information.
                      </p>
                    </div>
                    <div className="p-6 space-y-8">
                      {/* Logo Upload */}
                      <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                          <div className="size-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                            <ImagePlus className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-card rounded-full p-1.5 shadow-sm border">
                            <Upload className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium">Workspace Logo</span>
                          <p className="text-xs text-muted-foreground">
                            Recommended size: 400x400px. JPG, PNG or SVG.
                          </p>
                          <div className="flex gap-3 mt-1">
                            <button className="text-xs font-semibold text-primary hover:text-primary/80">
                              Upload new
                            </button>
                            <button className="text-xs font-semibold text-destructive hover:text-destructive/80">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Workspace Name */}
                      <div className="grid gap-2 max-w-lg">
                        <Label>Workspace Name</Label>
                        <Input
                          value={settings.workspaceName}
                          onChange={(e) =>
                            setSettings({ ...settings, workspaceName: e.target.value })
                          }
                        />
                      </div>

                      {/* Workspace URL */}
                      <div className="grid gap-2 max-w-lg">
                        <Label>Workspace URL</Label>
                        <div className="flex rounded-lg shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground text-sm">
                            app.qa-artifacts.com/
                          </span>
                          <Input
                            className="rounded-l-none"
                            value={settings.workspaceUrl}
                            onChange={(e) =>
                              setSettings({ ...settings, workspaceUrl: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Localization Card */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Localization</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set regional preferences for your team.
                      </p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <Label>Timezone</Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) =>
                            setSettings({ ...settings, timezone: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pst">
                              (GMT-08:00) Pacific Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="est">
                              (GMT-05:00) Eastern Time (US & Canada)
                            </SelectItem>
                            <SelectItem value="utc">(GMT+00:00) London</SelectItem>
                            <SelectItem value="cet">(GMT+01:00) Paris</SelectItem>
                            <SelectItem value="ict">(GMT+07:00) Ho Chi Minh City</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Language</Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            setSettings({ ...settings, language: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-us">English (US)</SelectItem>
                            <SelectItem value="fr">French (FR)</SelectItem>
                            <SelectItem value="es">Spanish (ES)</SelectItem>
                            <SelectItem value="de">German (DE)</SelectItem>
                            <SelectItem value="vi">Vietnamese (VN)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Team Preferences Card */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Team Preferences</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Control visibility and access settings.
                      </p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Enable Public Links</p>
                          <p className="text-sm text-muted-foreground">
                            Allow users to share test results via public URLs.
                          </p>
                        </div>
                        <Switch
                          checked={settings.publicLinks}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, publicLinks: checked })
                          }
                        />
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Allow Guest Access</p>
                          <p className="text-sm text-muted-foreground">
                            Guests can view projects without editing rights.
                          </p>
                        </div>
                        <Switch
                          checked={settings.guestAccess}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, guestAccess: checked })
                          }
                        />
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Weekly Digest Emails</p>
                          <p className="text-sm text-muted-foreground">
                            Send summary of test runs to all admins every Monday.
                          </p>
                        </div>
                        <Switch
                          checked={settings.weeklyDigest}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, weeklyDigest: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "users" && (
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">User Management</h3>
                  <p className="text-muted-foreground">
                    User management features coming soon...
                  </p>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">AI Configurations</h3>
                  <p className="text-muted-foreground">
                    AI configuration features coming soon...
                  </p>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Billing</h3>
                  <p className="text-muted-foreground">
                    Billing features coming soon...
                  </p>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-card rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <p className="text-muted-foreground">
                    Security features coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
