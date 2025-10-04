import { PATH_COMPONENT, respondWith } from "./utils.ts";
import { Octokit } from "octokit";
import { parse, parseRange, satisfies, Range } from "@std/semver";

export const REGEX = new RegExp(`^${PATH_COMPONENT.repeat(2)}\\/([^\\/]+)$`);
const api = new Octokit();

function tarballUrl(owner: string, repo: string, rev: string): string {
  const url = new URL(`https://api.github.com/repos/${owner}/${repo}/tarball/${rev}`);
  url.searchParams.set("rev", rev);
  return url.toString();
}

export async function getVersions(path: string): Promise<Response> {
  const match = REGEX.exec(path);
  if (!match) {
    return Response.json({ error: "regex_match_fail" }, { status: 400 });
  }

  const owner = match[1];
  const repo = match[2];

  let range: "latest" | Range;
  try {
    if (match[3] === "latest") {
      range = "latest";
    } else {
      range = parseRange(match[3]);
    }
  } catch (err) {
    const message = (err as Error).toString();
    return Response.json({ error: "range_parse_fail", message }, { status: 400 });
  }

  const tags = api.paginate.iterator(api.rest.repos.listTags, {
    owner,
    repo,
  });

  const failedVersions = [];
  for await (const { data } of tags) {
    for (const tag of data) {
      const url = tarballUrl(owner, repo, tag.commit.sha);
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
