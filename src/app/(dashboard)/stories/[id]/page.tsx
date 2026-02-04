"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronRight,
  Edit,
  Share2,
  Sparkles,
  User,
  ShieldCheck,
  MessageSquare,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with API call
const storyData = {
  id: "US-102",
  code: "US-102",
  project: "Calendar Pro",
  title: "Calendar Synchronization",
  description: "Ensure seamless bidirectional synchronization between the platform and third-party calendar providers to keep task deadlines up to date across all devices.",
  asA: "Product Manager",
  iWantTo: "Sync platform calendar with providers",
  soThat: "I can see all deadlines in one place",
  status: "Ready for Testing",
  lastUpdated: "2 hours ago",
  heroImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
  acceptanceCriteria: [
    {
      id: "AC-1",
      description: "Syncing must happen in real-time when a record is updated.",
      completed: true,
    },
    {
      id: "AC-2",
      description: "User can safely disconnect their calendar in the account settings menu.",
      completed: false,
    },
    {
      id: "AC-3",
      description: "Supports OAuth 2.0 authentication for Google and Outlook.",
      completed: false,
    },
    {
      id: "AC-4",
      description: "System handles rate limiting with user notifications.",
      completed: false,
    },
  ],
  assignedTeam: [
    { role: "Lead Developer", name: "Alex Rivera" },
    { role: "QA Tester", name: "Jordan Smith" },
  ],
  discussion: [
    {
      id: 1,
      author: "Sarah Adams",
      initials: "SA",
      color: "bg-indigo-100 text-indigo-600",
      message: "Should we support Apple Calendar in this first iteration as well? Many users requested it during the beta.",
      time: "2h ago",
    },
    {
      id: 2,
      author: "Mike K.",
      initials: "MK",
      color: "bg-amber-100 text-amber-600",
      message: "Let's stick to Google and Outlook for MVP. Apple requires a separate CalDAV implementation which is planned for US-105.",
      time: "1h ago",
    },
  ],
};

const tabs = [
  { id: "story", label: "Story" },
  { id: "test-case", label: "Test Case" },
  { id: "test-plan", label: "Test Plan" },
];

export default function StoryDetailPage() {
  const params = useParams();
  const storyId = params.id as string;
  
  const [activeTab, setActiveTab] = useState("story");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(["AC-1"]);
  const [newComment, setNewComment] = useState("");

  const toggleCriteria = (id: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm font-medium text-muted-foreground">
            <Link href="/workspaces" className="hover:text-primary transition-colors">Projects</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/stories" className="hover:text-primary transition-colors">{storyData.project}</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-semibold">{storyId || storyData.code}</span>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Story
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-10 px-6">
        {/* Header Section with Title and Tabs */}
        <div className="bg-card border rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 text-[10px] font-bold uppercase tracking-widest">
                  Project: {storyData.project}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Updated {storyData.lastUpdated}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Story Details</h1>
            </div>
            
            {/* Tabs */}
            <div className="flex p-1.5 bg-muted rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-8 py-2 rounded-lg text-sm font-semibold transition-all",
                    activeTab === tab.id
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Image Card */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              {/* Hero Image */}
              <div className="h-72 overflow-hidden relative">
                <img 
                  alt="Abstract network visualization" 
                  className="w-full h-full object-cover"
                  src={storyData.heroImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <Badge className="bg-primary text-white border-0 shadow-xl">
                    <span className="h-2 w-2 bg-white rounded-full mr-2.5 animate-pulse" />
                    {storyData.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20">
                    # {storyData.code}
                  </Badge>
                </div>
              </div>
              
              {/* Title & Description */}
              <div className="p-8">
                <h2 className="text-3xl font-extrabold mb-4">{storyData.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {storyData.description}
                </p>
              </div>
            </div>

            {/* User Story Requirements */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                User Story Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-muted/30 rounded-2xl p-8 border">
                <div className="md:col-span-3">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">As a</span>
                  <div className="text-xl font-bold mt-1">{storyData.asA}</div>
                </div>
                <div className="md:col-span-4">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">I want to</span>
                  <div className="text-xl font-bold mt-1">{storyData.iWantTo}</div>
                </div>
                <div className="md:col-span-5">
                  <span className="text-xs font-black text-primary uppercase tracking-tighter">So that</span>
                  <div className="text-xl font-bold mt-1">{storyData.soThat}</div>
                </div>
              </div>
            </div>

            {/* Discussion */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Discussion ({storyData.discussion.length})
                </h3>
                <Button variant="link" className="text-sm text-primary p-0">View all</Button>
              </div>
              
              <div className="space-y-8">
                {storyData.discussion.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full ${comment.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {comment.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{comment.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-8 pt-8 border-t flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  JD
                </div>
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-muted/30"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Acceptance Criteria */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Acceptance Criteria</h3>
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs font-bold">
                  {storyData.acceptanceCriteria.length} Items
                </Badge>
              </div>
              
              <div className="space-y-3 mb-8">
                {storyData.acceptanceCriteria.map((ac) => (
                  <label
                    key={ac.id}
                    className="flex items-start p-4 bg-muted/30 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                  >
                    <Checkbox
                      checked={selectedCriteria.includes(ac.id)}
                      onCheckedChange={() => toggleCriteria(ac.id)}
                      className="mt-0.5"
                    />
                    <span className="ml-4 text-sm font-medium leading-relaxed">
                      {ac.description}
                    </span>
                  </label>
                ))}
              </div>

              <div className="pt-6 border-t">
                <Button className="w-full gap-2 shadow-lg shadow-primary/20 py-6" size="lg">
                  <Sparkles className="h-5 w-5" />
                  Generate AI Test Cases
                </Button>
                <p className="text-center text-[9px] text-muted-foreground mt-4 uppercase tracking-[0.2em] font-bold">
                  Quality Engine Powered
                </p>
              </div>
            </div>

            {/* Assigned Team */}
            <div className="bg-card border rounded-xl p-8 shadow-sm">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">
                Assigned Teams
              </h4>
              <div className="space-y-6">
                {storyData.assignedTeam.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                        {member.role}
                      </span>
                      <span className="text-sm font-bold mt-0.5">{member.name}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-muted border flex items-center justify-center text-muted-foreground">
                      {member.role.includes("Developer") ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <ShieldCheck className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full py-12 px-6 border-t mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © 2024 QA Artifacts Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
