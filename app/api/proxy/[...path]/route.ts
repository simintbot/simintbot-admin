import { NextRequest, NextResponse } from 'next/server';

// Configuration de l'URL de base de l'API cible
const getApiUrl = () => {
  if (process.env.API_URL) return process.env.API_URL;
  
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.simint-bot.com/api/v1';
  }
  return 'https://devapi.simint-bot.com/api/v1';
};

const API_BASE_URL = getApiUrl();

async function proxyRequest(request: NextRequest, method: string, params: { path: string[] }) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  console.log(`[Proxy ${method}] Forwarding to: ${url}`);

  try {
    // Préparation des headers
    const headers = new Headers(request.headers);
    
    // Nettoyage des headers problématiques pour le proxy
    headers.delete('host');
    headers.delete('connection');
    headers.delete('content-length');
    
    // Ajout/Surcharge de headers si nécessaire
    headers.set('Accept', 'application/json');

    // Récupération du body pour les requêtes non-GET/HEAD
    let body: any = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
         try {
            body = JSON.stringify(await request.json());
         } catch(e) { /* empty body or invalid json */ }
      } else if (contentType?.includes('multipart/form-data')) {
         body = await request.formData();
      } else {
         try {
            body = await request.text();
         } catch (e) { /* error reading body */ }
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
      // @ts-ignore - Nécessaire si on a des soucis SSL self-signed en dev (optionnel)
      // agent: ... 
    });

    // Lecture de la réponse
    const responseBody = await response.blob(); 
    
    // Nettoyage des headers de réponse
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');
    
    // Création de la réponse Proxy
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });

    // Nettoyage des headers de réponse si nécessaire (CORS, etc géré par Next.js généralement)
    return proxyResponse;

  } catch (error: any) {
    console.error(`[Proxy Error] ${method} ${url}:`, error);
    return NextResponse.json(
      { error: 'Proxy Error', details: error.message },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, 'GET', resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, 'POST', resolvedParams);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, 'PUT', resolvedParams);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, 'PATCH', resolvedParams);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, 'DELETE', resolvedParams);
}
