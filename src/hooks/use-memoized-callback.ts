import { useCallback, useMemo, useRef } from 'react';

/**
 * Memoized callback hook that prevents unnecessary re-renders
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<T>();
  
  ref.current = useCallback(callback, deps);
  
  return useCallback((...args: Parameters<T>) => {
    return ref.current?.(...args);
  }, []) as T;
}

/**
 * Memoized value hook with custom equality function
 */
export function useMemoizedValue<T>(
  value: T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const ref = useRef<T>();
  const isEqual = equalityFn || ((a: T, b: T) => a === b);
  
  if (!ref.current || !isEqual(ref.current, value)) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]);
  
  return debouncedCallback as T;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastCallRef = useRef<number>(0);
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay, ...deps]);
  
  return throttledCallback as T;
}
