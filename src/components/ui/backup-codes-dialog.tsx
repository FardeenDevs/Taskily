
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: string[] | null;
}

const COUNTDOWN_SECONDS = 15;

export function BackupCodesDialog({ open, onOpenChange, codes }: BackupCodesDialogProps) {
  const { toast } = useToast();
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  
  useEffect(() => {
    if (open) {
      setCountdown(COUNTDOWN_SECONDS);
      setCopiedStates(new Array(codes?.length || 0).fill(false));
    }
  }, [open, codes]);
  
  useEffect(() => {
    if (open && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [open, countdown]);


  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      const newCopiedStates = [...copiedStates];
      newCopiedStates[index] = true;
      setCopiedStates(newCopiedStates);
      
      toast({ title: "Copied to clipboard!" });
      
      setTimeout(() => {
        setCopiedStates(prev => {
            const resetCopied = [...prev];
            resetCopied[index] = false;
            return resetCopied;
        });
      }, 2000);

    }).catch(err => {
      toast({ variant: "destructive", title: "Failed to copy" });
    });
  };

  const handleCopyAll = () => {
    if (!codes) return;
    const allCodes = codes.join('\n');
    navigator.clipboard.writeText(allCodes).then(() => {
        toast({ title: "All codes copied to clipboard!" });
    }).catch(err => {
        toast({ variant: "destructive", title: "Failed to copy" });
    });
  };

  if (!codes) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Save Your Backup Codes</DialogTitle>
          <DialogDescription>
            Store these codes in a safe place. They can be used to regain access to this listspace if you forget your password. Each code can only be used once.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-lg">
            {codes.map((code, index) => (
                <div key={index} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                    <span className="tracking-widest">{code}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(code, index)}>
                        {copiedStates[index] ? <Check className="text-green-500"/> : <Copy />}
                    </Button>
                </div>
            ))}
        </div>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
            <Button variant="outline" onClick={handleCopyAll}>
                <Copy className="mr-2" />
                Copy All Codes
            </Button>
          <Button onClick={() => onOpenChange(false)} disabled={countdown > 0}>
            {countdown > 0 ? `I have saved my codes (${countdown})` : "I have saved my codes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
