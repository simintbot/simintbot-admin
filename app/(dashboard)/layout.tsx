"use client";
import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import { MobileSidebarProvider } from "@/components/dashboard/MobileSidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <span className="font-semibold text-gray-800">SimintBot</span>
              <span className="font-semibold text-blue-600">Admin</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span>© 2026 SimintBot. Tous droits réservés.</span>
            </div>
          </footer>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
