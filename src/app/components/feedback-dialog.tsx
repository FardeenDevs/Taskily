"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type Feedback } from "@/lib/types";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;
  feedbacks: Feedback[];
  onSubmit: (feedback: string) => void;
}

export function FeedbackDialog({ open, onOpenChange, isOwner, feedbacks, onSubmit }: FeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("");

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSubmit(feedbackText.trim());
      setFeedbackText("");
      onOpenChange(false);
    }
  };
  
  const sortedFeedbacks = [...feedbacks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isOwner ? "Submitted Feedback" : "Submit Feedback"}</DialogTitle>
           <DialogDescription>
            {isOwner ? "Here's what users are saying." : "We'd love to hear your thoughts on how we can improve."}
          </DialogDescription>
        </DialogHeader>

        {isOwner ? (
          <ScrollArea className="h-72 mt-4">
            <div className="space-y-4 pr-6">
              {sortedFeedbacks.length > 0 ? (
                sortedFeedbacks.map((fb) => (
                  <div key={fb.id} className="rounded-lg border p-4 text-sm">
                    <p className="mb-2 text-muted-foreground">{fb.text}</p>
                    <p className="text-xs text-right text-muted-foreground/70">
                      {format(new Date(fb.createdAt), "PPP p")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No feedback has been submitted yet.
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="feedback-text">Your feedback</Label>
              <Textarea
                id="feedback-text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think..."
                rows={5}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isOwner ? "Close" : "Cancel"}
          </Button>
          {!isOwner && (
            <Button onClick={handleSubmit} disabled={!feedbackText.trim()}>
              Submit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
