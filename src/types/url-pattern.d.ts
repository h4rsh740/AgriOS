// ============================================================
// AgriOS — Global ambient type shims
// URLPattern is a newer web API not yet in TypeScript's dom lib.
// Next.js 16 references it in its own spec-extension types.
// Adding a minimal shim here silences the IDE errors without
// affecting runtime behaviour.
// ============================================================

interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

type URLPatternInput = string | URLPatternInit;
type URLPatternOptions = { ignoreCase?: boolean };

interface URLPatternResult {
  inputs: [URLPatternInput] | [URLPatternInput, string];
  protocol: URLPatternComponentResult;
  username: URLPatternComponentResult;
  password: URLPatternComponentResult;
  hostname: URLPatternComponentResult;
  port: URLPatternComponentResult;
  pathname: URLPatternComponentResult;
  search: URLPatternComponentResult;
  hash: URLPatternComponentResult;
}

interface URLPatternComponentResult {
  input: string;
  groups: Record<string, string | undefined>;
}

declare class URLPattern {
  constructor(init?: URLPatternInput, baseURL?: string, options?: URLPatternOptions);
  readonly protocol: string;
  readonly username: string;
  readonly password: string;
  readonly hostname: string;
  readonly port: string;
  readonly pathname: string;
  readonly search: string;
  readonly hash: string;
  test(input?: URLPatternInput, baseURL?: string): boolean;
  exec(input?: URLPatternInput, baseURL?: string): URLPatternResult | null;
}
