import * as gitea from "./gitea.ts";
import * as github from "./github.ts";
import * as nixpkgs from "./nixpkgs.ts";

const CACHE = await caches.open("v1");

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = decodeURIComponent(url.pathname);

  let response = await CACHE.match(req);

  if (response) {
    console.log(`Cache HIT: ${response.url} -> ${response.headers.get("Location")}`);
    // return response;
  }

  if (url.hostname.startsWith("gitea.")) {
    response = await gitea.getVersions(path);
  } else if (url.hostname.startsWith("github.")) {
    response = await github.getVersions(path);
  } else if (url.hostname.startsWith("nixpkgs.")) {
    response = await nixpkgs.getVersions(path);
  } else {
    return Response.redirect("https://github.com/andre4ik3/semver-redirector");
  }

  if (response.ok) {
    console.log(`Cache miss, saving: ${response.url} -> ${response.headers.get("Location")}`);
    await CACHE.put(req, response.clone());
  }

  return response;
});
