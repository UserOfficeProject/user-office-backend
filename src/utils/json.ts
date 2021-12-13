/* eslint-disable @typescript-eslint/no-explicit-any */
export default function jsonDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a != 'object' || typeof b != 'object') return false;
  if (Object.keys(a).length != Object.keys(b).length) return false;

  for (const key in a) {
    if (!jsonDeepEqual(a[key], b[key])) return false;
  }

  return true;
}
