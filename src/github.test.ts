import { expect, test } from "bun:test";
import github from "./github";
import { ok } from "./utils";
import { Range } from "semver";

test("argument parsing", () => {
  // github should default to public instance
  expect(github.parse("github", ["NixOS", "nix", "2"])).toStrictEqual(ok({
    name: "github",
    baseUrl: "https://api.github.com",
    owner: "NixOS",
    repo: "nix",
    range: new Range("2"),
  }));

  // custom github instance
  expect(github.parse("github", ["github.example.com", "NixOS", "nix", "2"])).toStrictEqual(ok({
    name: "github",
    baseUrl: "https://github.example.com",
    owner: "NixOS",
    repo: "nix",
    range: new Range("2"),
  }));

  // gitea/forgejo should use different API base URL
  expect(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "2"])).toStrictEqual(ok({
    name: "forgejo",
    baseUrl: "https://git.lix.systems/api/v1",
    owner: "lix-project",
    repo: "lix",
    range: new Range("2"),
  }));

  // latest range should get passed verbatim
  expect(github.parse("github", ["NixOS", "nix", "latest"])).toStrictEqual(ok({
    name: "github",
    baseUrl: "https://api.github.com",
    owner: "NixOS",
    repo: "nix",
    range: "latest",
  }));

  // test star syntax (tbh theres nothing it really tests since it just passes
  // the string but whatever, it's the thought that counts)
  expect(github.parse("github", ["9001", "copyparty", "*"])).toStrictEqual(ok({
    name: "github",
    baseUrl: "https://api.github.com",
    owner: "9001",
    repo: "copyparty",
    range: new Range("*"),
  }));

  // gitea/forgejo requires an instance URL
  expect(github.parse("forgejo", ["lix-project", "lix", "2"])).toHaveProperty("err");

  // version range required in all instances
  expect(github.parse("github", ["NixOS", "nix"])).toHaveProperty("err");
  expect(github.parse("github", ["github.example.com", "NixOS", "nix"])).toHaveProperty("err");
  expect(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix"])).toHaveProperty("err");

  // invalid semver
  expect(github.parse("github", ["NixOS", "nix", "__not_semver__"])).toHaveProperty("err");
  expect(github.parse("github", ["github.example.com", "NixOS", "nix", "__not_semver__"])).toHaveProperty("err");
  expect(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "__not_semver__"])).toHaveProperty("err");

  // other random invalid arg tests
  expect(github.parse("github", [])).toHaveProperty("err");
  expect(github.parse("forgejo", [])).toHaveProperty("err");
  expect(github.parse("github", ["NixOS", "nix", "third"])).toHaveProperty("err");
  expect(github.parse("github", ["NixOS", "nix", "third", "fourth"])).toHaveProperty("err");
  expect(github.parse("github", ["NixOS", "nix", "third", "fourth", "fifth"])).toHaveProperty("err");
  expect(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "fourth"])).toHaveProperty("err");
  expect(github.parse("forgejo", ["git.lix.systems", "lix-project", "lix", "fourth", "fifth"])).toHaveProperty("err");
});
