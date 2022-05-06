import { Rejection } from '../../models/Rejection';

/**
 * Creates UOS JWT token from external authorization service token
 */
export type LoginWithExternalToken = (
  token: string
) => Promise<string | Rejection>;
