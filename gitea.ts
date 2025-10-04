import { PATH_COMPONENT, respondWith } from "./utils.ts";
import { Octokit } from "octokit";
import { parse, parseRange, satisfies, Range } from "@std/semver";

export const REGEX = new RegExp(`^${PATH_COMPONENT.repeat(3)}\\/([^\\/]+)$`);

function tarballUrl(host: string, owner: string, repo: string, rev: string): string {
  const url = new URL(`https://${host}/${owner}/${repo}/archive/${rev}.tar.gz`);
  url.searchParams.set("rev", rev);
  return url.toString();
}

export async function getVersions(path: string): Promise<Response> {
  const match = REGEX.exec(path);
  if (!match) {
    return Response.json({ error: "regex_match_fail" }, { status: 400 });
  }

  const host = match[1];
  const owner = match[2];
  const repo = match[3];

  let range: "latest" | Range;
  try {
    if (match[4] === "latest") {
      range = "latest";
    } else {
      range = parseRange(match[4]);
    }
  } catch (err) {
    const message = (err as Error).toString();
    return Response.json({ error: "range_parse_fail", message }, { status: 400 });
  }

  // me when someone says gitea/forgejo isn't a ripoff of github:
  const api = new Octokit({
    baseUrl: `https://${host}/api/v1`,
  });

  const tags = api.paginate.iterator(api.rest.repos.listTags, {
    owner,
    repo,
  });

  const failedVersions = [];
  for await (const { data } of tags) {
    for (const tag of data) {
      const url = tarballUrl(host, owner, repo, tag.commit.sha);
      if (range === "latest") return respondWith(url);
      try {
        const version = parse(tag.name);
        if (satisfies(version, range)) return respondWith(url);
      } catch (err) {
        const message = (err as Error).toString();
        console.error(`Error while parsing tag ${tag}: ${message}`);
        failedVersions.push(tag.name);
      }
    }
  }

  return Response.json({ error: "no_matching_versions", failedVersions }, { status: 404 });
}
