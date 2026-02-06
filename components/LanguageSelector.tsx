"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";

interface LanguageSelectorProps {
  variant?: "simple" | "bordered";
}

export default function LanguageSelector({ variant = "simple" }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = useLocale();
  const t = useTranslations("LanguageSelector");

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "fr", label: "FR", name: t("fr"), flag: "/flags/fr.png" },
    { code: "en", label: "EN", name: t("en"), flag: "/flags/en.png" }
  ];

  const currentLang = languages.find((lang) => lang.code === activeLocale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    if (!pathname) return;
    const supported = ["fr", "en"];
    // Split and remove any empty segments
    const raw = pathname.split("/").filter(Boolean);
    // Remove any locale segments that might appear anywhere (robust against duplicates)
    const withoutLocales = raw.filter((seg) => !supported.includes(seg));
    // Build new path prefixed by the chosen locale
    const newPath = '/' + [newLocale, ...withoutLocales].join('/');
    // Use direct navigation to avoid i18n wrapper re-prefixing the path
    if (typeof window !== 'undefined') {
      window.location.href = newPath;
    } else {
      router.push(newPath);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-all duration-200 ${
          variant === "bordered"
            ? "border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 bg-white shadow-sm"
            : "hover:opacity-80 p-1"
        }`}
      >
        <div className="relative w-9 h-9 overflow-hidden rounded-full border border-gray-100">
          <Image src={currentLang.flag} alt={currentLang.label} fill className="object-cover" />
        </div>

        {variant === "bordered" && (
          <span className="text-sm font-semibold text-gray-900 tracking-tight uppercase">
            {currentLang.label}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-colors group ${
                  activeLocale === lang.code ? "bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative w-7 h-7 overflow-hidden rounded-full shadow-sm">
                  <Image src={lang.flag} alt={lang.name} fill className="object-cover" />
                </div>

                <span
                  className={`text-sm font-medium transition-colors ${
                    activeLocale === lang.code ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                  }`}
                >
                  {lang.name}
                </span>
              </button>
            ))}
          </div>

          <div className="absolute right-1 top-4 bottom-4 w-1 bg-gray-400/10 rounded-full pointer-events-none" />
        </div>
      )}
    </div>
  );
}
