import github from "./github";
import nixpkgs from "./nixpkgs";
import type { IProvider } from "./utils";

const PROVIDERS = [github, nixpkgs] as IProvider<string, unknown>[]; // TODO this is a hack
const CACHE = await caches.open("v1");

function cleanUrl(url: string) {
  if (url.endsWith(".tar.gz") || url.endsWith(".tar.xz")) {
    url = url.substring(0, url.length - 7);
  }

  return new URL(url);
}

async function handleRequest(request: Request): Promise<Response> {
  const url = cleanUrl(request.url);
  const name = request.headers.get("X-Semver-Provider") ?? url.hostname.split(".")[0]!;
  const args = url.pathname.split("/").slice(1).map(decodeURI);

  if (request.method !== "GET") return Response.json("error: only GET is allowed", { status: 405 });

  // Need to be very careful to not accidentally cache responses with authorization.
  // Nixpkgs provider does not use Authorization header.
  const canCache = !request.headers.has("Authorization") || name === "nixpkgs";

  let response: Response | undefined;
  if (canCache) response = await CACHE.match(url);

  if (!response) {
    for (const provider of PROVIDERS) {
      if (provider.match(name)) {
        const params = provider.parse(name, args);
        if (!params.success) return Response.json(`error: ${params.err}`, { status: 400 });
        response = await provider.handle(request, params.ok);
        break;
      }
    }

    if (response && response.status < 400 && canCache) await CACHE.put(url, response);
  }

  return response ?? Response.redirect("https://github.com/andre4ik3/semver-redirector");
}

export default {
  fetch: handleRequest,
};
