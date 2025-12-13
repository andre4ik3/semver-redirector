{
  inputs.nixpkgs.url = "https://nixpkgs.flake.andre4ik3.dev";

  outputs =
    { nixpkgs, ... }@inputs:
    (
      let
        inherit (nixpkgs) lib;
        systems = [
          "aarch64-darwin"
          "aarch64-linux"
          "x86_64-darwin"
          "x86_64-linux"
        ];
        eachSystem = f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
      in
      {
        devShells = eachSystem (pkgs: {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              bun
              deno
              biome
            ];
          };
        });
      }
    );
}
