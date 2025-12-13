import { expect, test } from "bun:test";
import nixpkgs from "./nixpkgs";
import { ok } from "./utils";

test("argument parsing", () => {
  // default should be stable
  expect(nixpkgs.parse("nixpkgs", [])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["primary"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["darwin"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(nixpkgs.parse("nixpkgs", ["small"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  // manually specifying stable

  expect(nixpkgs.parse("nixpkgs", ["stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["primary", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["stable", "primary"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["darwin", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(nixpkgs.parse("nixpkgs", ["stable", "darwin"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(nixpkgs.parse("nixpkgs", ["small", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  expect(nixpkgs.parse("nixpkgs", ["stable", "small"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  // rolling/unstable

  expect(nixpkgs.parse("nixpkgs", ["rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["primary", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["rolling", "primary"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(nixpkgs.parse("nixpkgs", ["darwin", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "darwin",
  }));

  expect(nixpkgs.parse("nixpkgs", ["rolling", "darwin"])).toStrictEqual(ok({
    status: "rolling",
    variant: "darwin",
  }));

  expect(nixpkgs.parse("nixpkgs", ["small", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "small",
  }));

  expect(nixpkgs.parse("nixpkgs", ["rolling", "small"])).toStrictEqual(ok({
    status: "rolling",
    variant: "small",
  }));

  // broken args

  expect(nixpkgs.parse("nixpkgs", ["__not_real__"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["rolling", "__not_real__"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["__not_real__", "rolling"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["darwin", "__not_real__"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["__not_real__", "darwin"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["__not_real__", "__not_real__"])).toHaveProperty("err");
  expect(nixpkgs.parse("nixpkgs", ["rolling", "darwin", "stable"])).toHaveProperty("err");
});
