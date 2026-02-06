import { logError } from '@/app/logger';

export const initErrorHandler = () => {
  const defaultHandler =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any)?.ErrorUtils?.getGlobalHandler?.() ??
    ((error: Error) => {
      console.error(error);
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any)?.ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
    logError('global_error', { error, isFatal });
    defaultHandler(error, isFatal);
  });
};
