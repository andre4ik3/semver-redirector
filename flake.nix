{
  inputs = {
    nixpkgs.url = "https://nixpkgs.flake.andre4ik3.dev";
    systems.url = "github:nix-systems/default";
  };

  outputs = { nixpkgs, ... }@inputs: (let
    inherit (nixpkgs) lib;
    systems = import inputs.systems;
    eachSystem = f: lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
  in {
    devShells = eachSystem (pkgs: {
      default = pkgs.mkShellNoCC {
        packages = [ pkgs.deno ];
      };
    });
  });
}
