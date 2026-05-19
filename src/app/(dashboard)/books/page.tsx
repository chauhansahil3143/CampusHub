import { redirect } from "next/navigation";

export default function BooksPage() {
  redirect("/study-material?tab=books");
}
