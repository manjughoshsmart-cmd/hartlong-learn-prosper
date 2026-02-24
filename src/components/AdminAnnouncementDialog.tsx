import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminAnnouncementDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);

    // Get all user IDs
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id");

    if (!profiles || profiles.length === 0) {
      toast({ title: "No users found", variant: "destructive" });
      setSending(false);
      return;
    }

    const rows = profiles.map((p) => ({
      user_id: p.user_id,
      title: title.trim(),
      message: message.trim(),
    }));

    const { error } = await supabase.from("notifications").insert(rows);

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Announcement sent", description: `Sent to ${profiles.length} users` });
      setTitle("");
      setMessage("");
      setOpen(false);
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Megaphone className="h-4 w-4" /> Send Announcement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Send Announcement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your announcement message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <Button onClick={send} disabled={sending || !title.trim() || !message.trim()} className="w-full">
            {sending ? "Sending…" : "Send to all users"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
