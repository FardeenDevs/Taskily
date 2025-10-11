
"use client";

import { useTasks } from "@/app/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useView } from "@/app/main-layout";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressView } from "../components/progress-view";
import { NotesView } from "../components/notes-view";

const NoteDialog = dynamic(() => import('@/app/components/note-dialog').then(mod => mod.NoteDialog), {
  loading: () => <LoadingSpinner />,
});
const PasswordPromptDialog = dynamic(() => import('@/app/components/password-prompt-dialog').then(mod => mod.PasswordPromptDialog), {
  loading: () => <LoadingSpinner />,
});


export default function AppPage() {
  const tasksHook = useTasks();
  const { currentView } = useView();

  const {
    editingNote,
    isNoteDialogOpen,
    handleCloseNoteDialog,
    handleSaveNote,
    isPasswordPromptOpen,
    activeWorkspace,
    setIsPasswordPromptOpen,
    handleUnlock,
    isUnlocking,
  } = tasksHook;

  return (
      <div className="mx-auto max-w-5xl w-full h-full p-4 sm:p-8">
        <Card className="border-2 border-border/50 shadow-2xl shadow-primary/5 overflow-hidden h-full flex flex-col">
          {currentView === 'progress' ? <ProgressView {...tasksHook} /> : <NotesView {...tasksHook} />}
        </Card>

        {/* Dialogs can remain here at the top level */}
        {isNoteDialogOpen && <NoteDialog
            open={isNoteDialogOpen}
            onOpenChange={handleCloseNoteDialog}
            note={editingNote}
            onSave={handleSaveNote}
        />}
        {isPasswordPromptOpen && activeWorkspace && <PasswordPromptDialog 
            open={isPasswordPromptOpen}
            onOpenChange={setIsPasswordPromptOpen}
            workspaceName={activeWorkspace.name}
            onUnlock={handleUnlock}
            isUnlocking={isUnlocking}
        />}
      </div>
  );
}
