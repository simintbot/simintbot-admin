import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the default locale login page
  redirect("/fr/login");
}
