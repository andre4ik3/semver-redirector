# Flake SemVer Redirector

Parses semantic version ranges in URLs and redirects them to matched tags in a
GitHub/Gitea/Forgejo repository.

When enumerating the repo's tags, any tags that don't conform to semantic
versioning will be skipped. If no version is matched, a list of these tags is
returned in the error.

The full semantic version syntax is supported, including complex specifiers,
such as `1.2.7 || >=1.2.9 <2.0.0`. However not all syntax is supported directly
in URLs: some special characters must be URL-encoded. See the [`semver` library
documentation][1] for a more detailed description of the supported syntax.

The special case `latest` causes all semantic version parsing to be skipped and
just returns the latest tag, making it possible to get the latest tag of flakes
that don't conform to semantic versioning.

It also supports fetching Nixpkgs channels from `channels.nixos.org`. In that
case, the first component is parsed as the target "status" (one of `stable` or
`rolling`), and the second component is parsed as the target "variant" (one of
`primary`, `darwin`, or `small`). If omitted, they default to `stable` and
`primary` respectively.

Such URLs will redirect to the `nixexprs.tar.xz` file, which is often smaller
and faster to fetch than the repo archive from `github:NixOS/nixpkgs` URLs.

Successful responses are cached for 5 minutes.

## Examples

Using the public instance located at <https://flake.andre4ik3.dev>:

```nix
{
  inputs = {
    # Get the current stable Nixpkgs channel (nixos-*.*):
    nixpkgs.url = "https://nixpkgs.flake.andre4ik3.dev";
    # Get the current stable Nixpkgs channel for Darwin (nixpkgs-*.*):
    nixpkgs-darwin.url = "https://nixpkgs.flake.andre4ik3.dev/stable/darwin";
    # Get the current stable Nixpkgs small channel (nixos-*.*-small):
    nixpkgs-small.url = "https://nixpkgs.flake.andre4ik3.dev/stable/small";
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

The project is a simple script made with [Deno][2]. You can run it like this:

```
deno run --allow-net main.ts
```

However it won't be very useful, since determining the handler is done via the
URL subdomain. You'll want to get a wildcard domain, or at least some
subdomains that start with `github.` for GitHub and `gitea.` for Gitea/Forgejo.
(Or you could change the script to determine the handler differently. It's
pretty simple after all.)

For local experimentation you can use [Caddy][3] with a configuration like
this:

```
https://*.flake.localhost {
    reverse_proxy http://127.0.0.1:8000
}
```

Make sure to trust the self-signed certificate Caddy generates. Then you should
be able to run commands like this with no problem:

```
nix flake show "https://github.flake.localhost/NixOS/nix/2"
```

[1]: https://jsr.io/@std/semver
[2]: https://deno.land
[3]: https://caddyserver.com
