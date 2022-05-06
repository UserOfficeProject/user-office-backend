/**
 * Creates UOS JWT token from external authorization service token
 */
export type LoginWithExternalToken = (token: string) => string;
