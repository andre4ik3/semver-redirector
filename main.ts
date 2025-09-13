import * as github from "./github.ts";
import * as gitea from "./gitea.ts";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = decodeURIComponent(url.pathname);

  if (url.hostname.startsWith("gitea.")) {
    return await gitea.getVersions(path);
  } else if (url.hostname.startsWith("github.")) {
    return await github.getVersions(path);
  } else {
    return Response.json({ error: "no_handler_found" }, { status: 404 });
  }
});
