export const printful = async (endpoint: string, options: RequestInit = {}) => {

    const requestId = `pf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!process.env.PRINTFUL) {
      console.error('Error: PRINTFUL API key is not set in environment variables');
      throw new Error('PRINTFUL API key not configured');
    }

    console.log('[Printful][request:start]', {
      requestId,
      method: options.method || 'GET',
      endpoint,
    });
  const res = await fetch(`https://api.printful.com/${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json();

  if(!res.ok){
    console.error('[Printful][request:error]', {
      requestId,
      method: options.method || 'GET',
      endpoint,
      status: res.status,
      statusText: res.statusText,
      response: data,
    });
    // Handle error response
    const errorMessage = 
      typeof data.error === 'string' 
        ? data.error 
        : (data.error?.message || data.message || 'Printful API request failed');
    const err: any = new Error(errorMessage);
    err.status = res.status;
    err.statusText = res.statusText;
    err.result = data?.result;
    err.error = data?.error;
    err.raw = data;
    throw err;
  }

  console.log('[Printful][request:success]', {
    requestId,
    method: options.method || 'GET',
    endpoint,
    status: res.status,
  });

  return data;
};
