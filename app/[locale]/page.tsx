import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className={cn("text-center space-y-4")}>
        <h1 className="text-4xl font-bold tracking-tight">{t("welcome")}</h1>
        <p className="text-xl text-gray-500">{t("description")}</p>
        <div className="mt-8">
           <p className="text-sm text-gray-400">{t("architecture_ready")}</p>
        </div>
        <div className="flex gap-4 justify-center mt-4">
          <Link href="/" locale="en" className="text-blue-500 hover:underline">English</Link>
          <Link href="/" locale="fr" className="text-blue-500 hover:underline">Français</Link>
        </div>
      </div>
    </div>
  );
}
