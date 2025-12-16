{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    utils.url = "github:numtide/flake-utils";
    playwright.url = "github:pietdevries94/playwright-web-flake";
  };
  outputs =
    {
      self,
      nixpkgs,
      utils,
      playwright,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        overlay = final: prev: {
          inherit (playwright.packages.${system}) playwright-test playwright-driver;
        };
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ overlay ];
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            biome
            turso

            pkgs.playwright-test

            cargo-audit
            cargo-nextest
            cargo-tarpaulin
            otel-desktop-viewer
            sqlx-cli
          ];

          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1;
          PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
          PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs_24}/bin/node";
          PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = "";
          PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH = "${pkgs.playwright.browsers}/chromium-1181/chrome-linux/chrome";

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
