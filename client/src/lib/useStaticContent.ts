/**
 * Custom hook for loading pre-generated static content
 *
 * This replaces API calls with direct fetches to static JSON files,
 * eliminating database queries and improving performance 10x.
 */

import { useState, useEffect } from 'react';

interface UseStaticContentResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Load static content from pre-generated JSON files
 *
 * @param path - Path to JSON file relative to /content/
 * @returns Loading state and data
 *
 * @example
 * const { data, isLoading, error } = useStaticContent<ProfileData>('profile.json');
 */
export function useStaticContent<T>(path: string): UseStaticContentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/content/${path}`);

        if (!response.ok) {
          throw new Error(`Failed to load ${path}: ${response.statusText}`);
        }

        const json = await response.json();

        if (!cancelled) {
          setData(json);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, isLoading, error };
}

/**
 * Load multiple static content files in parallel
 *
 * @param paths - Array of paths to JSON files
 * @returns Loading state and data array
 *
 * @example
 * const { data, isLoading } = useStaticContentMultiple([
 *   'profile.json',
 *   'case-studies.json'
 * ]);
 */
export function useStaticContentMultiple<T extends any[]>(
  paths: string[]
): UseStaticContentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAllContent() {
      try {
        setIsLoading(true);
        setError(null);

        const responses = await Promise.all(
          paths.map(path => fetch(`/content/${path}`))
        );

        // Check if all responses are OK
        responses.forEach((response, index) => {
          if (!response.ok) {
            throw new Error(`Failed to load ${paths[index]}: ${response.statusText}`);
          }
        });

        const jsonData = await Promise.all(
          responses.map(response => response.json())
        );

        if (!cancelled) {
          setData(jsonData as T);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    }

    loadAllContent();

    return () => {
      cancelled = true;
    };
  }, [paths.join(',')]);

  return { data, isLoading, error };
}
