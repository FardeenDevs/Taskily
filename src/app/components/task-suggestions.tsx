
"use client";

import { useState, memo } from "react";
import { type Task } from "@/lib/types";
import { getTaskSuggestions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskSuggestionsProps {
  currentTasks: Task[];
  onAddTask: (text: string) => void;
}

export const TaskSuggestions = memo(function TaskSuggestions({ currentTasks, onAddTask }: TaskSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const uncompletedTasks = currentTasks
        .filter((task) => !task.completed)
        .map((task) => task.text);
      
      if(uncompletedTasks.length === 0) {
        toast({
            variant: "destructive",
            title: "No active tasks",
            description: "Please add some tasks before asking for suggestions.",
        });
        setIsLoading(false);
        setIsOpen(false);
        return;
      }

      const result = await getTaskSuggestions(uncompletedTasks);
      setSuggestions(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch suggestions. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestion = (suggestion: string) => {
    onAddTask(suggestion);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={handleFetchSuggestions}
          disabled={currentTasks.filter(t => !t.completed).length === 0}
          className="disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Suggest Tasks
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Task Suggestions</DialogTitle>
          <DialogDescription>
            Here are some tasks you might want to add based on your current list.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 min-h-[150px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 rounded-md bg-secondary/50 p-3">
                    <p className="text-sm">{suggestion}</p>
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => handleAddSuggestion(suggestion)} aria-label={`Add task: ${suggestion}`}>
                      <Plus className="h-4 w-4"/>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No suggestions available.
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
