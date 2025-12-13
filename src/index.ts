import * as github from "./github";
import * as nixpkgs from "./nixpkgs";

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const provider = url.hostname.split(".")[0]!;

  let path = url.pathname;
  if (path.endsWith(".tar.gz") || path.endsWith(".tar.xz")) {
    path = path.substring(0, path.length - 7);
  }

  const args = path.split("/").slice(1).map(decodeURI);

  if (github.match(provider)) {
    const params = github.parse(provider, args);
    if (!params.success)
      return Response.json(`error: ${params.err}`, { status: 400 });
    return await github.handle(request, params.ok);
  } else if (nixpkgs.match(provider)) {
    const params = nixpkgs.parse(provider, args);
    if (!params.success)
      return Response.json(`error: ${params.err}`, { status: 400 });
    return await nixpkgs.handle(request, params.ok);
  }

  return Response.redirect("https://github.com/andre4ik3/semver-redirector");
}

if (import.meta.main) {
  Bun.serve({
    port: 8000,
    fetch: handleRequest,
  });
}
