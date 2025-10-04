import * as gitea from "./gitea.ts";
import * as github from "./github.ts";
import * as nixpkgs from "./nixpkgs.ts";

const CACHE = await caches.open("v1");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = decodeURIComponent(url.pathname);

  let response = await CACHE.match(req);

  if (response) {
    return response;
  }

  if (url.hostname.startsWith("gitea.")) {
    response = await gitea.getVersions(path);
  } else if (url.hostname.startsWith("github.")) {
    response = await github.getVersions(path);
  } else if (url.hostname.startsWith("nixpkgs.")) {
  response = await nixpkgs.getVersions(path);
  } else {
    return Response.json({ error: "no_handler_found" }, { status: 404 });
  }

  if (response.ok) {
    await CACHE.put(req, response.clone());
  }

  return response;
});
