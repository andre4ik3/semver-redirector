import { Octokit, RequestError } from "octokit";
import type { Range } from "semver";
import { err, type IProvider, ok, parseRange, parseVersion, type Result, respondWith, USER_AGENT } from "./utils";

const NAMES = ["github", "gitea", "forgejo"] as const;

type Name = (typeof NAMES)[number];

function tarballUrl(provider: Name, host: string, owner: string, repo: string, rev: string) {
  let url: URL;
  if (provider === "github") {
    url = new URL(`https://${host}/repos/${owner}/${repo}/tarball/${rev}`);
  } else {
    url = new URL(`https://${host}/${owner}/${repo}/archive/${rev}.tar.gz`);
  }
  url.searchParams.set("rev", rev);
  return url.toString();
}

export interface Parameters {
  name: Name;
  host: string;
  owner: string;
  repo: string;
  range: Range | "latest";
}

export class GitHubProvider implements IProvider<Name, Parameters> {
  match(str: string): str is Name {
    return NAMES.includes(str as Name);
  }

  parse(name: Name, args: string[]): Result<Parameters, string> {
    let host = "api.github.com";

    if (args.length < 3 || args.length > 4) {
      return err(`must have 3 or 4 arguments, instead got ${args.length}`);
    }

    // biome-ignore-start lint/style/noNonNullAssertion: length is checked above

    if (args.length === 4) {
      host = args.shift()!;
    } else if (name !== "github") {
      return err(`provider '${name}' requires a host`);
    }

    const owner = args.shift()!;
    const repo = args.shift()!;

    const range = parseRange(args.shift()!);
    if (!range.success) {
      return err(`failed to parse semver range: ${range.err}`);
    }

    // biome-ignore-end lint/style/noNonNullAssertion: length is checked above

    return ok({ name, host, owner, repo, range: range.ok });
  }

  async handle(request: Request, { name, host, owner, repo, range }: Parameters): Promise<Response> {
    const baseUrl = name === "github" ? `https://${host}` : `https://${host}/api/v1`;

    const auth = request.headers.get("Authorization") ?? undefined;
    const api = new Octokit({ baseUrl, userAgent: USER_AGENT });
    const tags = api.paginate.iterator(api.rest.repos.listTags, { owner, repo, headers: { authorization: auth } });

    try {
      for await (const { data } of tags) {
        for (const tag of data) {
          const url = tarballUrl(name, host, owner, repo, tag.commit.sha);
          // short circuit to get latest tag for repos that don't follow semver
          if (range === "latest") return respondWith(url);

          const version = parseVersion(tag.name);
          if (!version.success) continue;
          if (range.test(version.ok)) return respondWith(url);
        }
      }
    } catch (e) {
      if (e instanceof RequestError) {
        return Response.json(`error: ${e.status} ${e.message}`, { status: e.status });
      } else {
        console.error(e);
        return Response.json("error: internal server error", { status: 500 });
      }
    }

    return Response.json("error: no versions were found", { status: 404 });
  }
}

export default new GitHubProvider();
