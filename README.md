# CodeCommit Linker - VSCode Extension

## Overview

The **CodeCommit Linker** extension enhances your development workflow by integrating AWS CodeCommit directly into Visual Studio Code. Generate and manage links to your CodeCommit repositories with ease.

## Features

- **Dynamic URL Generation**: Automatically creates URLs for files or selections in your AWS CodeCommit repository.
- **Direct Browser Opening**: Open your CodeCommit files or selections in the web browser with a single command.
- **Seamless Git Integration**: Uses VSCode's Git extension to detect current repository and branch, falling back to user settings when necessary.

## Installation

1. Open VSCode.
2. Navigate to the Extensions view (`Ctrl+Shift+X`).
3. Search for "CodeCommit Linker".
4. Click **Install**.

## Configuration

After installation, configure the extension:

- Open **Settings** (`Ctrl+,`).
- Search for "CodeCommit Linker" in the settings.
- Set your preferences:

  - `codecommitlinker.repositoryName`: Your AWS CodeCommit repository name.
  - `codecommitlinker.repositoryBranch`: Default branch (optional, will use current branch if available).
  - `codecommitlinker.region`: AWS region where your repository resides.

## Usage

- **Generate CodeCommit URL**: Open a file from your repository, then:
  - Use the Command Palette (`Ctrl+Shift+P`) and select `CodeCommit Linker: Generate URL for CodeCommit`.
  - Or right-click within the editor and choose `Generate URL for CodeCommit`.

- **Open in Browser**: 
  - Invoke the command `CodeCommit Linker: Open CodeCommit in Browser` from the Command Palette or context menu.

## Commands

- `codecommitlinker.generateLink`: Generates a CodeCommit URL for the current file or selection.
- `codecommitlinker.openInBrowser`: Opens the current file or selection in CodeCommit via your default browser.

## Development Setup

To contribute or run locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yeahthisisrob/codecommit-linker.git