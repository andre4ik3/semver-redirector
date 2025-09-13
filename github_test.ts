import { assertEquals } from "@std/assert";
import { REGEX } from "./github.ts";

Deno.test(function copyparty() {
  assertEquals(
    REGEX.exec("/9001/copyparty/1.x")!.values().toArray().slice(1),
    ["9001", "copyparty", "1.x"],
  );
});
