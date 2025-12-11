export const printful = async (endpoint: string, options: RequestInit = {}) => {

    console.log("API",process.env.PRINTFUL);
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
    console.error('Printful API Error:', data);
    throw new Error(data.error || 'Printful API request failed');
  }

  return data;
};
