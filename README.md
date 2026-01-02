# Flake SemVer Redirector

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)][Deploy to Cloudflare] [![Deploy to Deno](https://deno.com/button)][Deploy to Deno]

Parses semantic version ranges in URLs and redirects them to matched tags in a
GitHub/Gitea/Forgejo repository.

When enumerating the repo's tags, any tags that don't conform to semantic
versioning will be skipped. If no version is matched, a list of these tags is
returned in the error.

The full semantic version syntax is supported, including complex specifiers,
such as `1.2.7 || >=1.2.9 <2.0.0`. However not all syntax is supported directly
in URLs: some special characters must be URL-encoded. See the [`semver` library
documentation][Semver] for a more detailed description of the supported syntax.

The special case `latest` causes all semantic version parsing to be skipped and
just returns the latest tag, making it possible to get the latest tag of flakes
that don't conform to semantic versioning.

Successful responses from Git forges cached for 5 minutes.

If an `Authorization` header is present, it will be passed through to the Git
forge. Such requests are not subject to any caching.

It also supports fetching Nixpkgs channels from `channels.nixos.org`. In that
case, the first component is parsed as the target "status" (one of `stable` or
`rolling`), and the second component is parsed as the target "variant" (one of
`primary`, `darwin`, or `small`). If omitted, they default to `stable` and
`primary` respectively.

Such URLs will redirect to the `nixexprs.tar.xz` file, which is often smaller
and faster to fetch than the repo archive from `github:NixOS/nixpkgs` URLs.

## Examples

Using the public instance located at <https://flake.andre4ik3.dev>:

```nix
{
  inputs = {
    # Get the current stable Nixpkgs channel (nixos-*.*):
    nixpkgs.url = "https://nixpkgs.flake.andre4ik3.dev";
    # Get the current stable Nixpkgs channel for Darwin (nixpkgs-*.*):
    nixpkgs-darwin.url = "https://nixpkgs.flake.andre4ik3.dev/darwin";
    # Get the current stable Nixpkgs small channel (nixos-*.*-small):
    nixpkgs-small.url = "https://nixpkgs.flake.andre4ik3.dev/small";
    # Get the latest Nix version:
    nix.url = "https://github.flake.andre4ik3.dev/NixOS/nix/*";
    # Or pin to a specific version while allowing patch updates:
    nix-28.url = "https://github.flake.andre4ik3.dev/NixOS/nix/2.28";
    # Get the latest stable Ghostty version:
    ghostty.url = "https://github.flake.andre4ik3.dev/ghostty-org/ghostty/*";
    # Using ^ syntax requires URL-encoding it ("^" is "%5E" in URL encoded form):
    lanzaboote.url = "https://github.flake.andre4ik3.dev/nix-community/lanzaboote/%5E0.4.2";
    # Get the latest 1.x Copyparty:
    copyparty.url = "https://github.flake.andre4ik3.dev/9001/copyparty/1";
    # Get the latest 2.91 Lix version:
    lix.url = "https://gitea.flake.andre4ik3.dev/git.lix.systems/lix-project/lix/2.91";
  };

  outputs = { ... }: { };
}
```

## Running

This project uses [Bun] as the package manager and test runner. After installing
Bun, run `bun i` to install dependencies, `bun run check` to check TypeScript
types and linter errors, and `bun test` to run tests.

However, Bun cannot be used as the runtime due to its lack of support for the
Web Cache API. The easiest way to run the project locally is with [Deno], like
this:

```
# Start listening on localhost:8000
deno run start
```

However it won't be very useful, since determining the handler is done via the
URL subdomain. You'll want to get a wildcard domain, or at least some
subdomains that start with `github.` for GitHub and `gitea.` for Gitea/Forgejo.
(Or you could change the script to determine the handler differently. It's
pretty simple after all.)

For local experimentation you can use [Caddy] with a configuration like this:

```
http://*.flake.localhost {
    reverse_proxy http://127.0.0.1:8000
}
```

Make sure `*.flake.localhost` resolves to `127.0.0.1` or `::1`. Then you should
be able to run commands like this with no problem:

```
nix flake show "http://github.flake.localhost/NixOS/nix/2"
```

[Semver]: https://www.npmjs.com/package/semver
[Deno]: https://deno.land
[Bun]: https://bun.com
[Caddy]: https://caddyserver.com
[Deploy to Deno]: https://console.deno.com/new?clone=https%3A%2F%2Fgithub.com%2Fandre4ik3%2Fsemver-redirector&install=deno+install
[Deploy to Cloudflare]: https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fandre4ik3%2Fsemver-redirector
