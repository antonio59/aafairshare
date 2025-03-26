import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  method: string = 'GET',
  data?: unknown | undefined,
): Promise<T> {
  console.log(`Making ${method} request to ${url}`, data ? { data } : '');
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "XMLHttpRequest",
      // Add Cache-Control to prevent caching issues
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Critical - include cookies
    mode: 'cors',
    cache: 'no-cache',
    redirect: 'follow'
  };
  
  console.log("Fetch options:", fetchOptions);
  
  const res = await fetch(url, fetchOptions);

  console.log(`Response from ${url}:`, {
    status: res.status,
    ok: res.ok,
    headers: [...res.headers.entries()].reduce((obj, [key, val]) => ({...obj, [key]: val}), {})
  });

  await throwIfResNotOk(res);
  
  // For 204 No Content responses (commonly used in DELETE operations), 
  // don't try to parse the response as JSON as there's no body
  if (res.status === 204) {
    return ({} as any);
  }
  
  const responseData = await res.json();
  console.log(`Parsed response data from ${url}:`, responseData);
  return responseData as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle array query keys properly
    let url = queryKey[0] as string;
    
    // If we have additional query parameters in the key, add them to the URL
    if (queryKey.length > 1 && queryKey[1]) {
      // Check if it's the settlements endpoint with month parameter
      if (url === '/api/settlements' && typeof queryKey[1] === 'string') {
        url += `?month=${queryKey[1]}`;
      } 
      // For other endpoints, just append the month parameter
      else if (typeof queryKey[1] === 'string' && !url.includes(queryKey[1])) {
        url += url.includes('?') ? '&' : '?';
        url += `month=${queryKey[1]}`;
      }
    }
    
    console.log(`Making GET request to ${url} via queryFn`);
    const queryFetchOptions: RequestInit = {
      method: 'GET',
      credentials: "include",
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    };
    
    console.log("Query fetch options:", queryFetchOptions);
    const res = await fetch(url, queryFetchOptions);
    console.log(`Response from ${url} in queryFn:`, {
      status: res.status,
      ok: res.ok
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // For 204 No Content responses, don't try to parse the response as JSON
    if (res.status === 204) {
      // Return empty object cast to the generic type
      return ({} as any);
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
