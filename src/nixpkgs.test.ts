import { expect, test } from "bun:test";
import { parse } from "./nixpkgs";
import { ok } from "./utils";

test("argument parsing", () => {
  // default should be stable
  expect(parse("nixpkgs", [])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["primary"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["darwin"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(parse("nixpkgs", ["small"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  // manually specifying stable

  expect(parse("nixpkgs", ["stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["primary", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["stable", "primary"])).toStrictEqual(ok({
    status: "stable",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["darwin", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(parse("nixpkgs", ["stable", "darwin"])).toStrictEqual(ok({
    status: "stable",
    variant: "darwin",
  }));

  expect(parse("nixpkgs", ["small", "stable"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  expect(parse("nixpkgs", ["stable", "small"])).toStrictEqual(ok({
    status: "stable",
    variant: "small",
  }));

  // rolling/unstable

  expect(parse("nixpkgs", ["rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["primary", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["rolling", "primary"])).toStrictEqual(ok({
    status: "rolling",
    variant: "primary",
  }));

  expect(parse("nixpkgs", ["darwin", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "darwin",
  }));

  expect(parse("nixpkgs", ["rolling", "darwin"])).toStrictEqual(ok({
    status: "rolling",
    variant: "darwin",
  }));

  expect(parse("nixpkgs", ["small", "rolling"])).toStrictEqual(ok({
    status: "rolling",
    variant: "small",
  }));

  expect(parse("nixpkgs", ["rolling", "small"])).toStrictEqual(ok({
    status: "rolling",
    variant: "small",
  }));

  // broken args

  expect(parse("nixpkgs", ["__not_real__"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["rolling", "__not_real__"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["__not_real__", "rolling"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["darwin", "__not_real__"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["__not_real__", "darwin"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["__not_real__", "__not_real__"])).toHaveProperty("err");
  expect(parse("nixpkgs", ["rolling", "darwin", "stable"])).toHaveProperty("err");
});
