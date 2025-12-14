{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
  };
  outputs =
    {
      self,
      nixpkgs,
      utils,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            biome
            turso

            cargo-audit
            cargo-nextest
            cargo-tarpaulin
            otel-desktop-viewer
            sqlx-cli
          ];

          OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318";
          OTEL_TRACES_EXPORTER = "otlp";
          OTEL_EXPORTER_OTLP_PROTOCOL = "http/protobuf";
          STATIC_ASSETS_FOLDER = "static";
          RUSTUP_TOOLCHAIN = "stable";

          LD_LIBRARY_PATH = "${pkgs.stdenv.cc.cc.lib}/lib";
        };
      }
    );
}
