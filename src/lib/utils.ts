import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ReadonlyURLSearchParams } from 'next/navigation';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createQueryString(
  name: string,
  value: string,
  searchParams: ReadonlyURLSearchParams
) {
  const params = new URLSearchParams(searchParams.toString());
  
  if (value) {
    params.set(name, value);
  } else {
    params.delete(name);
  }

  return params.toString();
}
