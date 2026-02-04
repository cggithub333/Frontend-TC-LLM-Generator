"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Save,
  Search,
  Folder,
  Plus,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const existingSuites = [
  { id: "TS-AUTH-001", name: "Authentication Module", testCases: 24 },
  { id: "TS-PAYMENT-001", name: "Payment Processing", testCases: 18 },
  { id: "TS-CHECKOUT-001", name: "Checkout Flow", testCases: 32 },
  { id: "TS-ADMIN-001", name: "Admin Dashboard", testCases: 15 }
];

interface SaveTestCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testCaseTitle?: string;
}

export function SaveTestCaseModal({
  open,
  onOpenChange,
  testCaseTitle = "Verify Google OAuth Login Flow"
}: SaveTestCaseModalProps) {
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");

  const filteredSuites = existingSuites.filter(suite =>
    suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suite.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    // Handle save logic here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Save Test Case to Suite</DialogTitle>
          <DialogDescription>
            Select an existing suite or create a new one for: <span className="font-semibold text-foreground">{testCaseTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Search */}
          {!isCreatingNew && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search existing suites..."
                className="pl-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Create New Suite Form */}
          {isCreatingNew ? (
            <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Create New Suite</h3>
                  <p className="text-xs text-muted-foreground">Enter a name for your new test suite</p>
                </div>
              </div>
              <Input
                placeholder="e.g., User Management Tests"
                value={newSuiteName}
                onChange={(e) => setNewSuiteName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewSuiteName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!newSuiteName.trim()}
                  onClick={() => {
                    // Handle create new suite
                    setIsCreatingNew(false);
                  }}
                >
                  Create Suite
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Existing Suites List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Existing Suites
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary font-bold"
                    onClick={() => setIsCreatingNew(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New
                  </Button>
                </div>

                <ScrollArea className="h-64 rounded-xl border border-border">
                  <div className="p-2 space-y-2">
                    {filteredSuites.map((suite) => (
                      <div
                        key={suite.id}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/40 hover:bg-accent/50",
                          selectedSuite === suite.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card"
                        )}
                        onClick={() => setSelectedSuite(suite.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Folder className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-muted-foreground">
                                {suite.id}
                              </span>
                              {selectedSuite === suite.id && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <h4 className="font-bold text-sm truncate">{suite.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {suite.testCases} test cases
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredSuites.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No suites found</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-primary font-bold mt-2"
                          onClick={() => setIsCreatingNew(true)}
                        >
                          Create a new suite
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedSuite && !isCreatingNew}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Test Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
