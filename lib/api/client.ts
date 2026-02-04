import { authUtils } from "@/lib/auth/utils";
import { RequestOptions, RequestMethod, ApiErrorResponse } from "./types";
import toast from "react-hot-toast";
import { getLocale } from "next-intl/server";

// Helper to determine if we are on the server
const isServer = typeof window === "undefined";

/**
 * Wrapper générique pour fetch avec gestion automatique de l'auth, des locales et du feedback UI.
 */
export async function apiRequest<T>(
  endpoint: string,
  method: RequestMethod = "GET",
  body?: any,
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    loadingMessage,
    successMessage,
    hideError = false,
    params,
    headers = {},
    ...customConfig
  } = options;

  let toastId: string | undefined;

  // 1. Afficher le loader (Client-side seulement pour toast)
  if (loadingMessage && !isServer) {
    toastId = toast.loading(loadingMessage);
  }

  try {
    // 2. Préparer les headers
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Injecter le token d'auth
    const token = await authUtils.getAccessToken();
    if (token) {
      (requestHeaders as any)["Authorization"] = `Bearer ${token}`;
    }

    // Injecter la locale
    let locale = "fr";
    if (isServer) {
      // Sur le serveur, on récupère via next-intl
      try {
        locale = await getLocale();
      } catch (e) {
        console.warn("Could not get locale on server", e);
      }
    } else {
      // Sur le client, on peut lire le cookie ou utiliser 'fr' par défaut
      const match = document.cookie.match(new RegExp("(^| )NEXT_LOCALE=([^;]+)"));
      if (match) locale = match[2];
    }
    (requestHeaders as any)["Accept-Language"] = locale;

    // 3. Construire l'URL avec les params
    let url = endpoint;
    if (endpoint.startsWith("/")) {
       // TODO: Remplacer par votre URL de base d'API via une variable d'environnement
       const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
       url = `${API_BASE_URL}${endpoint}`;
    }

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    // 4. Exécuter la requête
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      ...customConfig,
    });

    // 5. Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Partial<ApiErrorResponse>;
      const errorMessage = errorData.message || `Erreur ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json().catch(() => null) as T;

    // 6. Succès
    if (successMessage && !isServer && toastId) {
      toast.success(successMessage, { id: toastId });
    } else if (successMessage && !isServer) {
       toast.success(successMessage);
    } else if (toastId && !isServer) {
       toast.dismiss(toastId);
    }

    return data;

  } catch (error: any) {
    // 7. Gestion des erreurs
    const message = error.message || "Une erreur inconnue est survenue.";
    
    if (toastId && !isServer) {
      toast.error(message, { id: toastId });
    } else if (!hideError && !isServer) {
      toast.error(message);
    }

    // Sur le serveur, on log juste l'erreur
    if (isServer) {
      console.error(`API Error [${method} ${endpoint}]:`, message);
    }

    throw error; // Propager l'erreur pour que le caller puisse réagir si besoin
  }
}
