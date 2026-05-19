import { redirect } from "next/navigation";

export default function NotesPage() {
  redirect("/study-material?tab=notes");
}
