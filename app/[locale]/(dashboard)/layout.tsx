"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { MobileSidebarProvider } from "@/components/dashboard/MobileSidebarContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import { useTranslations } from "next-intl";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Layout");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Hydrate token from localStorage and redirect if absent
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }
      apiClient.setToken(token);
      setCheckingAuth(false);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-gray-500">{t("auth_checking")}</div>
      </div>
    );
  }

  return (
    <MobileSidebarProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar fixe à gauche */}
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Navbar en haut */}
          <Navbar />
          
          {/* Contenu de la page */}
          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="px-4 sm:px-6 py-3 bg-white border-t flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-800">{tCommon("brand_name")}</span>
              <span className="font-semibold text-blue-600">{tCommon("brand_admin")}</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span>{tCommon("footer_rights")}</span>
            </div>
          </footer>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
