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
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  // For 204 No Content responses (commonly used in DELETE operations), 
  // don't try to parse the response as JSON as there's no body
  if (res.status === 204) {
    return ({} as any);
  }
  
  return await res.json() as T;
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
    
    const res = await fetch(url, {
      credentials: "include",
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
