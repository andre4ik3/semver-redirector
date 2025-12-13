import type { Range } from "semver";
import { ok, err, type Result, parseRange, respondWith, parseVersion, USER_AGENT } from "./utils";
import { Octokit, RequestError } from "octokit";

const PROVIDERS = ["github", "gitea", "forgejo"] as const;

type Provider = (typeof PROVIDERS)[number];

function tarballUrl(provider: Provider, baseUrl: string, owner: string, repo: string, rev: string) {
  let url: URL;
  if (provider === "github") {
    url = new URL(`${baseUrl}/repos/${owner}/${repo}/tarball/${rev}`);
  } else {
    url = new URL(`${baseUrl}/${owner}/${repo}/archive/${rev}.tar.gz`);
  }
  url.searchParams.set("rev", rev);
  return url.toString();
}

export interface Parameters {
  provider: Provider;
  baseUrl: string;
  owner: string;
  repo: string;
  range: Range | "latest";
}

export function match(provider: string): provider is Provider {
  return PROVIDERS.includes(provider as Provider);
}

export function parse(provider: Provider, args: string[]): Result<Parameters, string> {
  let host: string = "api.github.com";

  if (args.length < 3 || args.length > 4) {
    return err(`must have 3 or 4 arguments, instead got ${args.length}`);
  }

  if (args.length === 4) {
    host = args.shift()!;
  } else if (provider !== "github") {
    return err(`provider '${provider}' requires a host`);
  }

  const baseUrl = provider === "github" ? `https://${host}` : `https://${host}/api/v1`;
  const owner = args.shift()!;
  const repo = args.shift()!;

  const range = parseRange(args.shift()!);
  if (!range.success) {
    return err(`failed to parse semver range: ${range.err}`);
  }

  return ok({ provider, baseUrl, owner, repo, range: range.ok });
}

export async function handle(request: Request, { provider, baseUrl, owner, repo, range }: Parameters): Promise<Response> {
  const auth = request.headers.get("Authorization") ?? undefined;
  const api = new Octokit({ baseUrl, userAgent: USER_AGENT });
  const tags = api.paginate.iterator(api.rest.repos.listTags, { owner, repo, headers: { authorization: auth } });

  try {
    for await (const { data } of tags) {
      for (const tag of data) {
        const url = tarballUrl(provider, baseUrl, owner, repo, tag.commit.sha);
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
      return Response.json(`error: internal server error`, { status: 500 });
    }
  }

  return Response.json("error: no versions were found", { status: 404 });
}
