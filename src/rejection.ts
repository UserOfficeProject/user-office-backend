const REJECTION = Symbol('REJECTION');

export interface Rejection {
  [REJECTION]: true;
  error: string;
  context?: Record<string, unknown>;
  exception?: Error;
}

export function rejection(
  error: string,
  context?: Record<string, unknown>
): Rejection;
export function rejection(
  error: string,
  context?: Record<string, unknown>,
  exception?: Error
): Rejection;

export function rejection(
  error: string,
  context?: Record<string, unknown>,
  exception?: Error
): Rejection {
  return { [REJECTION]: true, error, context, exception };
}

export function isRejection(value: any): value is Rejection {
  return REJECTION in Object(value);
}
