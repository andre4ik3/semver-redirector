import { assertEquals, assertFalse } from "@std/assert";
import { parseRange } from "@std/semver";
import github from "./github.ts";
import { ok } from "./utils.ts";

Deno.test("argument parsing", () => {
  // github should default to public instance
  assertEquals(
    github.parse("github", ["NixOS", "nix", "2"]),
    ok({
      name: "github",
      host: "api.github.com",
      owner: "NixOS",
      repo: "nix",
      range: parseRange("2"),
    }),
  );

  // custom github instance
  assertEquals(
    github.parse("github", ["github.example.com", "NixOS", "nix", "2"]),
    ok({
      name: "github",
      host: "github.example.com",
      owner: "NixOS",
      repo: "nix",
      range: parseRange("2"),
    }),
  );

  // gitea/forgejo should use different API base URL
  assertEquals(
    github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "2"]),
    ok({
      name: "forgejo",
      host: "git.lix.systems",
      owner: "lix-project",
      repo: "lix",
      range: parseRange("2"),
    }),
  );

  // latest range should get passed verbatim
  assertEquals(
    github.parse("github", ["NixOS", "nix", "latest"]),
    ok({
      name: "github",
      host: "api.github.com",
      owner: "NixOS",
      repo: "nix",
      range: "latest",
    }),
  );

  // test star syntax (tbh theres nothing it really tests since it just passes
  // the string but whatever, it's the thought that counts)
  assertEquals(
    github.parse("github", ["9001", "copyparty", "*"]),
    ok({
      name: "github",
      host: "api.github.com",
      owner: "9001",
      repo: "copyparty",
      range: parseRange("*"),
    }),
  );

  // gitea/forgejo requires an instance URL
  assertFalse(github.parse("forgejo", ["lix-project", "lix", "2"]).success);

  // version range required in all instances
  assertFalse(github.parse("github", ["NixOS", "nix"]).success);
  assertFalse(github.parse("github", ["github.example.com", "NixOS", "nix"]).success);
  assertFalse(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix"]).success);

  // invalid semver
  assertFalse(github.parse("github", ["NixOS", "nix", "__not_semver__"]).success);
  assertFalse(github.parse("github", ["github.example.com", "NixOS", "nix", "__not_semver__"]).success);
  assertFalse(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "__not_semver__"]).success);

  // other random invalid arg tests
  assertFalse(github.parse("github", []).success);
  assertFalse(github.parse("forgejo", []).success);
  assertFalse(github.parse("github", ["NixOS", "nix", "third"]).success);
  assertFalse(github.parse("github", ["NixOS", "nix", "third", "fourth"]).success);
  assertFalse(github.parse("github", ["NixOS", "nix", "third", "fourth", "fifth"]).success);
  assertFalse(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "fourth"]).success);
  assertFalse(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "fourth", "fifth"]).success);
});
