import github from "./github.ts";
import nixpkgs from "./nixpkgs.ts";
import type { IProvider } from "./utils.ts";

const PROVIDERS = [github, nixpkgs] as IProvider<string, unknown>[]; // TODO this is a hack

function cleanUrl(url: string) {
  if (url.endsWith(".tar.gz") || url.endsWith(".tar.xz")) {
    url = url.substring(0, url.length - 7);
  }

  return new URL(url);
}

async function handleRequest(request: Request): Promise<Response> {
  const url = cleanUrl(request.url);
  // biome-ignore lint/style/noNonNullAssertion: splitting will always have at least one element
  const name = request.headers.get("X-Semver-Provider") ?? url.hostname.split(".")[0]!;
  const args = url.pathname.split("/").slice(1).map(decodeURI);

  if (request.method !== "GET" || request.headers.has("Upgrade")) {
    return Response.json("error: only GET is allowed", { status: 405 });
  }

  let response: Response | undefined;

  for (const provider of PROVIDERS) {
    if (provider.match(name)) {
      const params = provider.parse(name, args);
      if (!params.success) return Response.json(`error: ${params.err}`, { status: 400 });
      response = await provider.handle(request, params.ok);
      break;
    }
  }

  return response ?? Response.redirect("https://github.com/andre4ik3/semver-redirector");
}

export default {
  fetch: handleRequest,
};
