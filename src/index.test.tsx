const mockRender = jest.fn();

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({ render: mockRender })),
}));

jest.mock('@edx/frontend-platform', () => ({
  APP_READY: 'APP_READY',
  APP_INIT_ERROR: 'APP_INIT_ERROR',
  initialize: jest.fn(),
  mergeConfig: jest.fn(),
  snakeCaseObject: jest.fn((value) => value),
  subscribe: jest.fn(),
}));

jest.mock('@/components/app/App', () => function MockApp() {
  return <div>App</div>;
});

jest.mock('./components/ErrorPage', () => ({
  ErrorPage: ({ message }: { message: string }) => <div>{message}</div>,
}));

jest.mock('./index.scss', () => ({}));
jest.mock('./i18n', () => ({}));

describe('index bootstrap config', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  const loadAndGetConfigHandler = async () => {
    await import('./index');
    const platform = await import('@edx/frontend-platform');
    const initializeMock = platform.initialize as jest.Mock;
    const latestCall = initializeMock.mock.calls[initializeMock.mock.calls.length - 1];

    return {
      mergeConfigMock: platform.mergeConfig as jest.Mock,
      configHandler: latestCall[0].handlers.config as () => void,
    };
  };

  it('merges ESSENTIALS and TEAMS URLs when env vars are set', async () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      ESSENTIALS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-essentials/',
      TEAMS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-teams/',
    };

    const { mergeConfigMock, configHandler } = await loadAndGetConfigHandler();
    configHandler();

    expect(mergeConfigMock).toHaveBeenCalledWith(expect.objectContaining({
      ESSENTIALS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-essentials/',
      TEAMS_PRODUCT_URL: 'https://business.edx.org/course-library-plans-teams/',
    }));

    process.env = originalEnv;
  });

  it('merges null ESSENTIALS and TEAMS URLs when env vars are unset', async () => {
    const originalEnv = process.env;
    const envCopy = { ...originalEnv };
    delete envCopy.ESSENTIALS_PRODUCT_URL;
    delete envCopy.TEAMS_PRODUCT_URL;
    process.env = envCopy;

    const { mergeConfigMock, configHandler } = await loadAndGetConfigHandler();
    configHandler();

    expect(mergeConfigMock).toHaveBeenCalledWith(expect.objectContaining({
      ESSENTIALS_PRODUCT_URL: null,
      TEAMS_PRODUCT_URL: null,
    }));

    process.env = originalEnv;
  });
});
