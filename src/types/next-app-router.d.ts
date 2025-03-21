/**
 * Type definitions for Next.js App Router
 * Compatible with Next.js 14.x and React 19
 */

declare module 'next' {
  import type { ReactNode } from 'react';

  // Next.js 15 specific type definitions
  export interface PageProps<
    Params extends Record<string, string> = Record<string, string>,
    SearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
  > {
    params: Params;
    searchParams: Promise<SearchParams>;
  }

  export interface LayoutProps<
    Params extends Record<string, string> = Record<string, string>
  > {
    children: ReactNode;
    params: Params;
  }

  export interface Metadata {
    title?: string | null;
    description?: string | null;
    keywords?: string | string[];
    authors?: Array<{ name: string; url?: string }>;
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      images?: Array<{
        url: string;
        width?: number;
        height?: number;
        alt?: string;
      }>;
      locale?: string;
      type?: string;
    };
    twitter?: {
      card?: string;
      title?: string;
      description?: string;
      creator?: string;
      images?: string[];
    };
    // Allow for other properties with specific types
    [key: string]: string | string[] | boolean | number | null | undefined | Record<string, unknown>;
  }

  export interface GenerateMetadata<
    Params extends Record<string, string> = Record<string, string>,
    SearchParams extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
  > {
    (props: { params: Params; searchParams: SearchParams }): Promise<Metadata> | Metadata;
  }
}
