import {
  extensions,
  window,
  workspace,
  commands,
  Uri,
  ExtensionContext,
  env,
} from 'vscode';

// Configuration keys
const REPO_CONFIG_KEY = 'codecommitlinker.repositoryName';
const BRANCH_CONFIG_KEY = 'codecommitlinker.repositoryBranch';
const REGION_CONFIG_KEY = 'codecommitlinker.region';

// Constants for URL construction
const CODECOMMIT_BASE_URL =
  'https://console.aws.amazon.com/codesuite/codecommit/repositories';
const BROWSE_PATH = '/browse';
const REGION_QUERY_PARAM = '?region=';

export async function getGitRepoInfo() {
  const gitExtension = extensions.getExtension('vscode.git');
  if (gitExtension) {
    await gitExtension.activate();
    const gitAPI = gitExtension.exports.getAPI(1);
    const repositories = gitAPI.repositories;
    if (repositories.length > 0) {
      const repository = repositories[0];
      const repoName = repository.rootUri.path.split('/').pop();
      
      const HEAD = repository.state && repository.state.HEAD ? repository.state.HEAD : await repository.getHEAD();
      const branch = HEAD.name;
      
      return { repoName, branch };
    }
  }
  return { repoName: null, branch: null };
}

export async function getCodeCommitUrl(filePath: string): Promise<string> {
  let { repoName, branch } = await getGitRepoInfo();

  // Fallback to settings if Git extension did not provide the values
  if (!repoName) {
    repoName =
      workspace.getConfiguration().get<string>(REPO_CONFIG_KEY) ||
      'default-repo';
  }
  if (!branch) {
    branch =
      workspace.getConfiguration().get<string>(BRANCH_CONFIG_KEY) || 'master';
  }

  const region =
    workspace.getConfiguration().get<string>(REGION_CONFIG_KEY) || 'us-west-2';

  // Trim the repository name from the start of the filePath
  if (filePath && filePath.startsWith(repoName + '/')) {
    filePath = filePath.substring((repoName + '/').length);
  }

  return `${CODECOMMIT_BASE_URL}/${repoName}${BROWSE_PATH}/${branch}/--/${filePath}${REGION_QUERY_PARAM}${region}`;
}

export function getFilePath(): string | undefined {
  const editor = window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    return workspaceFolder
      ? document.uri.fsPath.substring(workspaceFolder.uri.fsPath.length + 1)
      : undefined;
  }
  return undefined;
}

function executeIfFileOpen(action: (filePath: string) => void) {
  const filePath = getFilePath();
  if (filePath) {
    action(filePath);
  } else {
    window.showErrorMessage('No file is currently open.');
  }
}

export function activate(context: ExtensionContext) {
  let generateLinkCmd = commands.registerCommand(
    'codecommitlinker.generateLink',
    async () => {
      executeIfFileOpen(async (filePath) => {
        const url = await getCodeCommitUrl(filePath);
        env.clipboard.writeText(url);
        window.showInformationMessage('CodeCommit link copied to clipboard!');
      });
    },
  );

  let openInBrowserCmd = commands.registerCommand(
    'codecommitlinker.openInBrowser',
    async () => {
      executeIfFileOpen(async (filePath) => {
        const url = await getCodeCommitUrl(filePath);
        env.openExternal(Uri.parse(url));
        window.showInformationMessage('Opening CodeCommit link in browser...');
      });
    },
  );

  context.subscriptions.push(generateLinkCmd, openInBrowserCmd);
}

export function deactivate() {}
