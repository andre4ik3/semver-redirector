import { assertEquals } from "@std/assert";
import { REGEX } from "./gitea.ts";

Deno.test(function lixModule() {
  assertEquals(
    REGEX.exec("/git.lix.systems/lix-project/nixos-module/latest")!.values().toArray().slice(1),
    ["git.lix.systems", "lix-project", "nixos-module", "latest"],
  );
});
