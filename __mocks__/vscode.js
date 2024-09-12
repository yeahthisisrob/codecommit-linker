module.exports = {
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
};
