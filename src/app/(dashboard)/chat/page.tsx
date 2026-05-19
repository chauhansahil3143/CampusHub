import { MessageSquare } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-muted/5">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold">Welcome to Campus Chat</h3>
      <p className="text-muted-foreground mt-2 max-w-md text-center">
        Select a room from the sidebar to start collaborating with your peers, asking questions, and discussing topics!
      </p>
    </div>
  );
}
