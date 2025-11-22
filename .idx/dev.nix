{ pkgs, ... }: {
  # Use the stable-24.05 channel for Nix packages to ensure reproducibility.
  channel = "stable-24.05";

  # Install necessary packages for the development environment.
  # nodejs_22 is used to satisfy the project's dependency requirements.
  packages = [
    pkgs.nodejs_22  # Updated from nodejs_20
    pkgs.unzip
    pkgs.gcc
    pkgs.gnumake
    pkgs.zip
  ];

  # Environment variables can be defined here if needed.
  env = {};

  # Configuration for the IDX workspace.
  idx = {
    # Recommended VS Code extensions.
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "dbaeumer.vscode-eslint" # Good for any JS project
      "expo.vscode-expo-tools" # Specific for Expo
    ];

    # Configure the web preview for the application.
    previews = {
      enable = true; # Enable the preview
      previews = {
        web = {
          # Command to start the Expo web development server.
          # It runs inside the 'app' directory.
          command = ["sh" "-c" "cd app && npx expo start --web --port $PORT"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks.
    workspace = {
      # Commands to run when the workspace is first created.
      onCreate = {
        # Install npm dependencies inside the 'app' directory.
        npm-install = "cd app && npm install";
      };
    };
  };
}
