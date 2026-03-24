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
    workspaceName: "QuraEx Production",
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
                            app.quraex.com/
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
                <div className="space-y-6">
                  {/* Members Table */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Team Members</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Manage who has access to this workspace.
                        </p>
                      </div>
                      <Button className="gap-2" size="sm">
                        <Users className="h-4 w-4" />
                        Invite Member
                      </Button>
                    </div>
                    <div className="divide-y">
                      {[
                        { name: "Hoa Ba Van", email: "hoangbavan4478@gmail.com", role: "Owner", status: "Active", lastActive: "Today" },
                        { name: "Van", email: "vchun0201@gmail.com", role: "Member", status: "Active", lastActive: "Today" },
                      ].map((member) => (
                        <div key={member.email} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                          <Select defaultValue={member.role.toLowerCase()}>
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground w-16 text-right">{member.lastActive}</span>
                          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Active" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pending Invitations */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Pending Invitations</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Invitations waiting for acceptance.
                      </p>
                    </div>
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No pending invitations</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-6">
                  {/* LLM Provider */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">LLM Provider</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Configure the AI model used for test case generation.
                      </p>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                          <Label>Model Provider</Label>
                          <Select defaultValue="gemini">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gemini">Google Gemini Pro</SelectItem>
                              <SelectItem value="gpt4">OpenAI GPT-4</SelectItem>
                              <SelectItem value="claude">Anthropic Claude 3.5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>API Key</Label>
                          <Input type="password" placeholder="••••••••••••••••" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                          <Label>Temperature <span className="text-muted-foreground font-normal">(0.0 - 1.0)</span></Label>
                          <Input type="number" defaultValue="0.7" min="0" max="1" step="0.1" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Max Tokens</Label>
                          <Input type="number" defaultValue="4096" />
                        </div>
                      </div>
                      <Button variant="outline" className="gap-2" size="sm">
                        <Bot className="h-4 w-4" />
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  {/* Default Prompt Template */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Default Prompt Template</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize the prompt used to generate test cases from user stories.
                      </p>
                    </div>
                    <div className="p-6">
                      <textarea
                        className="w-full h-40 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        defaultValue={`Given the following user story:\n\nTitle: {{story.title}}\nAs a: {{story.asA}}\nI want to: {{story.iWantTo}}\nSo that: {{story.soThat}}\n\nAcceptance Criteria:\n{{#each acceptanceCriteria}}\n- {{this.content}}\n{{/each}}\n\nGenerate comprehensive test cases covering positive, negative, and edge cases.`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Current Plan</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage your subscription and billing preferences.
                      </p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="flex-1 p-5 rounded-xl bg-primary/5 border-2 border-primary">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold">Free Plan</span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Current</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Up to 3 projects • 100 test cases/mo • 2 team members</p>
                        </div>
                        <div className="flex-1 p-5 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold">Pro Plan</span>
                            <span className="text-sm text-muted-foreground">$29/mo</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Unlimited projects • 5,000 test cases/mo • 20 members</p>
                          <Button size="sm" className="mt-3 gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" />
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Usage This Month</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Test Cases Generated</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">13</span>
                          <span className="text-sm text-muted-foreground mb-0.5">/ 100</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: "13%" }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">API Calls</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">47</span>
                          <span className="text-sm text-muted-foreground mb-0.5">/ 1,000</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: "4.7%" }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Team Members</p>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">2</span>
                          <span className="text-sm text-muted-foreground mb-0.5">/ 2</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: "100%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Billing History</h3>
                    </div>
                    <div className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No billing history — you&apos;re on the Free plan.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  {/* Authentication */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Authentication</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Strengthen workspace security with multi-factor authentication.
                      </p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                          <p className="text-sm text-muted-foreground">
                            Require all workspace members to use 2FA.
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Single Sign-On (SSO)</p>
                          <p className="text-sm text-muted-foreground">
                            Enable SAML-based enterprise SSO.
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Session Management</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid gap-2 max-w-sm">
                        <Label>Session Timeout</Label>
                        <Select defaultValue="8h">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 hour</SelectItem>
                            <SelectItem value="4h">4 hours</SelectItem>
                            <SelectItem value="8h">8 hours</SelectItem>
                            <SelectItem value="24h">24 hours</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Password Policy */}
                  <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-6 border-b">
                      <h3 className="text-lg font-semibold">Password Policy</h3>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Minimum 8 Characters</p>
                          <p className="text-sm text-muted-foreground">
                            Enforce a minimum password length.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Require Special Characters</p>
                          <p className="text-sm text-muted-foreground">
                            At least one special character (!@#$%).
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <hr className="border-border" />
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">Password Expiry</p>
                          <p className="text-sm text-muted-foreground">
                            Force password change every 90 days.
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
