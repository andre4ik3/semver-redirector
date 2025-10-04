import { assertEquals } from "@std/assert";
import { REGEX } from "./nixpkgs.ts";

Deno.test(function copyparty() {
  assertEquals(
    REGEX.exec("/stable")!.values().toArray().slice(1),
    ["stable", undefined],
  );
  assertEquals(
    REGEX.exec("/stable/darwin")!.values().toArray().slice(1),
    ["stable", "darwin"],
  );
});
