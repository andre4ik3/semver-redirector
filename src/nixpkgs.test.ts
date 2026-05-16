import { assertEquals, assertFalse } from "@std/assert";
import nixpkgs from "./nixpkgs.ts";
import { ok } from "./utils.ts";

Deno.test("argument parsing", () => {
  // default should be stable
  assertEquals(
    nixpkgs.parse("nixpkgs", []),
    ok({
      status: "stable",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["primary"]),
    ok({
      status: "stable",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["darwin"]),
    ok({
      status: "stable",
      variant: "darwin",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["small"]),
    ok({
      status: "stable",
      variant: "small",
    }),
  );

  // manually specifying stable

  assertEquals(
    nixpkgs.parse("nixpkgs", ["stable"]),
    ok({
      status: "stable",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["primary", "stable"]),
    ok({
      status: "stable",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["stable", "primary"]),
    ok({
      status: "stable",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["darwin", "stable"]),
    ok({
      status: "stable",
      variant: "darwin",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["stable", "darwin"]),
    ok({
      status: "stable",
      variant: "darwin",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["small", "stable"]),
    ok({
      status: "stable",
      variant: "small",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["stable", "small"]),
    ok({
      status: "stable",
      variant: "small",
    }),
  );

  // rolling/unstable

  assertEquals(
    nixpkgs.parse("nixpkgs", ["rolling"]),
    ok({
      status: "rolling",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["primary", "rolling"]),
    ok({
      status: "rolling",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["rolling", "primary"]),
    ok({
      status: "rolling",
      variant: "primary",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["darwin", "rolling"]),
    ok({
      status: "rolling",
      variant: "darwin",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["rolling", "darwin"]),
    ok({
      status: "rolling",
      variant: "darwin",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["small", "rolling"]),
    ok({
      status: "rolling",
      variant: "small",
    }),
  );

  assertEquals(
    nixpkgs.parse("nixpkgs", ["rolling", "small"]),
    ok({
      status: "rolling",
      variant: "small",
    }),
  );

  // broken args

  assertFalse(nixpkgs.parse("nixpkgs", ["__not_real__"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["rolling", "__not_real__"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["__not_real__", "rolling"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["darwin", "__not_real__"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["__not_real__", "darwin"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["__not_real__", "__not_real__"]).success);
  assertFalse(nixpkgs.parse("nixpkgs", ["rolling", "darwin", "stable"]).success);
});
