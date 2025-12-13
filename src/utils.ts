import { Range, SemVer } from "semver";

export const USER_AGENT = "NixSemverRedirector/1.0 (+https://github.com/andre4ik3/semver-redirector)";

export type Result<T, E> =
  | { success: true; ok: T }
  | { success: false; err: E };

export function ok<T>(ok: T): Result<T, never> {
  return { success: true, ok };
}

export function err<E>(err: E): Result<never, E> {
  return { success: false, err };
}

export function parseVersion(version: string): Result<SemVer, string> {
  try {
    return ok(new SemVer(version));
  } catch (e) {
    return err((e as Error).message);
  }
}

export function parseRange(range: string): Result<Range | "latest", string> {
  if (range === "latest") return ok("latest");
  try {
    return ok(new Range(range.replace(".tar.gz", "")));
  } catch (e) {
    return err((e as Error).message);
  }
}

export function respondWith(tarballUrl: string): Response {
  return new Response(null, {
    status: 307,
    headers: {
      Location: tarballUrl,
      Link: `<${tarballUrl}>; rel="immutable"`,
      "Cache-Control": "max-age=300",
    },
  });
}

export interface IProvider<Name extends string, Parameters> {
  match(str: string): str is Name;
  parse(name: Name, args: string[]): Result<Parameters, string>;
  handle(request: Request, parameters: Parameters): Promise<Response>;
}
