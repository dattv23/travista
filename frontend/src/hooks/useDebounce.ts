import { useEffect, useRef, useCallback } from 'react';

export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void | Promise<void>,
  delay: number,
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay],
  );
};
