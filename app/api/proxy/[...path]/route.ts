import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  console.log('[Proxy GET]', url);

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy GET Error]', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  console.log('[Proxy POST]', url);

  const contentType = request.headers.get('Content-Type') || '';
  const authHeader = request.headers.get('Authorization');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    let body: any;
    if (contentType.includes('multipart/form-data')) {
      // Forward FormData as-is
      body = await request.formData();
    } else {
      headers['Content-Type'] = 'application/json';
      body = await request.text();
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.text();
    
    // Log response for debugging
    if (!response.ok) {
      console.error('[Proxy POST Response Error]', response.status, data);
    }
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy POST Error]', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  console.log('[Proxy PUT]', url);

  const contentType = request.headers.get('Content-Type') || '';
  const authHeader = request.headers.get('Authorization');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    let body: any;
    let fetchHeaders = { ...headers };
    
    if (contentType.includes('multipart/form-data')) {
      // Forward FormData as-is (don't set Content-Type, fetch will set it with boundary)
      body = await request.formData();
    } else {
      fetchHeaders['Content-Type'] = 'application/json';
      body = await request.text();
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: fetchHeaders,
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy PUT Error]', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  console.log('[Proxy PATCH]', url);

  const contentType = request.headers.get('Content-Type') || '';
  const authHeader = request.headers.get('Authorization');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    let body: any;
    let fetchHeaders = { ...headers };
    
    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
    } else {
      fetchHeaders['Content-Type'] = 'application/json';
      body = await request.text();
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: fetchHeaders,
      body,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy PATCH Error]', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${pathname}${searchParams ? `?${searchParams}` : ''}`;

  console.log('[Proxy DELETE]', url);

  const authHeader = request.headers.get('Authorization');

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy DELETE Error]', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
