import {
  extensions,
  window,
  workspace,
  Uri,
  ExtensionContext,
  commands,
  Selection,
  Position,
} from 'vscode';
import {
  activate,
  getGitRepoInfo,
  getCodeCommitUrl,
  getFilePath,
} from '../src/extension';

jest.mock('vscode', () => ({
  extensions: {
    getExtension: jest.fn(),
  },
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn(),
      update: jest.fn(),
    })),
    getWorkspaceFolder: jest.fn((uri) => {
      if (uri.fsPath.includes('/workspace/myrepo')) {
        return {
          uri: { fsPath: '/workspace/myrepo' },
          name: 'myrepo',
          index: 0,
        };
      }
      return undefined;
    }),
  },
  window: {
    activeTextEditor: undefined,
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
  },
  commands: {
    registerCommand: jest.fn(),
  },
  Uri: {
    parse: jest.fn((path) => ({
      scheme: 'file',
      authority: '',
      path,
      query: '',
      fragment: '',
      fsPath: path,
      with: jest.fn(),
      toString: jest.fn(() => path),
      toJSON: jest.fn(() => path),
    })),
  },
  env: {
    clipboard: {
      writeText: jest.fn(),
    },
  },
  Selection: jest.fn((start, end) => ({
    start,
    end,
    isActive: true,
    isReversed: false,
    isEmpty: start.isEqual(end),
  })),
  Position: jest.fn((line, character) => ({
    line,
    character,
    isBefore: jest.fn(),
    isAfter: jest.fn(),
    isBeforeOrEqual: jest.fn(),
    isAfterOrEqual: jest.fn(),
    translate: jest.fn(),
    with: jest.fn(),
    isEqual: jest.fn(),
  })),
}));

describe('Visual Studio Code Extension Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test getGitRepoInfo
  describe('getGitRepoInfo', () => {
    it('returns repo information when the Git extension is available', async () => {
      const mockGetAPI = jest.fn(() => ({
        repositories: [{
          rootUri: { path: '/user/repo' },
          state: {
            HEAD: {
              name: 'main'
            }
          },
          getHEAD: async () => ({ name: 'main' }),
        }],
      }));
      (extensions.getExtension as jest.Mock).mockReturnValue({
        activate: jest.fn(),
        exports: { getAPI: mockGetAPI },
      });
    
      const result = await getGitRepoInfo();
      expect(result).toEqual({ repoName: 'repo', branch: 'main' });
    });

    it('returns nulls when no repositories are available', async () => {
      const mockGetAPI = jest.fn(() => ({ repositories: [] }));
      (extensions.getExtension as jest.Mock).mockReturnValue({
        activate: jest.fn(),
        exports: { getAPI: mockGetAPI },
      });

      const result = await getGitRepoInfo();
      expect(result).toEqual({ repoName: null, branch: null });
    });
  });

  // Test getCodeCommitUrl
  describe('getCodeCommitUrl', () => {
    it('constructs URL correctly using Git info', async () => {
      const mockWorkspaceConfig = {
        get: jest.fn((key: string) => {
          if (key === 'codecommitlinker.repositoryName') return 'myrepo';
          if (key === 'codecommitlinker.repositoryBranch') return 'develop';
          if (key === 'codecommitlinker.region') return 'us-west-2';
        }),
        has: jest.fn(),
        inspect: jest.fn(),
        update: jest.fn(),
      };

      jest
        .spyOn(workspace, 'getConfiguration')
        .mockReturnValue(mockWorkspaceConfig as any);

      const url = await getCodeCommitUrl('path/to/file');
      expect(url).toBe(
        'https://console.aws.amazon.com/codesuite/codecommit/repositories/myrepo/browse/develop/--/path/to/file?region=us-west-2',
      );
    });
  });

  // Test getFilePath
  describe('getFilePath', () => {
    it('returns the file path when an editor is open', () => {
      window.activeTextEditor = {
        document: {
          uri: Uri.parse('/workspace/myrepo/path/to/file'),
          fileName: '/workspace/myrepo/path/to/file',
          isUntitled: false,
          languageId: 'typescript',
          version: 1,
          isDirty: false,
          isClosed: false,
          save: jest.fn(),
        },
        selection: new Selection(new Position(0, 0), new Position(0, 0)),
        selections: [new Selection(new Position(0, 0), new Position(0, 0))],
        visibleRanges: [],
        options: {},
        viewColumn: undefined,
      } as any;

      const filePath = getFilePath();
      expect(filePath).toBe('path/to/file');
    });

    it('returns undefined when no editor is open', () => {
      window.activeTextEditor = undefined;
      const filePath = getFilePath();
      expect(filePath).toBeUndefined();
    });
  });

  // Test Command Execution
  describe('Command Execution', () => {
    it('activates commands successfully', () => {
      const mockContext = {
        subscriptions: [],
        workspaceState: {},
        globalState: {},
        extensionUri: Uri.parse('file:///path/to/extension'),
        environmentVariableCollection: {},
        storageUri: Uri.parse('file:///path/to/storage'),
        globalStorageUri: Uri.parse('file:///path/to/global/storage'),
        logUri: Uri.parse('file:///path/to/log'),
        extensionMode: {},
        extension: {},
        secrets: {
          get: jest.fn(),
          store: jest.fn(),
          delete: jest.fn(),
        },
      } as unknown as ExtensionContext;

      activate(mockContext);
      expect(commands.registerCommand).toHaveBeenCalled();
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });
});
