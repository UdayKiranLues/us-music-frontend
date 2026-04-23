import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Capacitor plugins
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    platform: 'web',
  },
}));

jest.mock('@capgo/native-audio', () => ({
  NativeAudio: {
    preload: jest.fn(),
    unload: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    setCurrentTime: jest.fn(),
    getDuration: jest.fn(),
    isPlaying: jest.fn(),
    isPreloaded: jest.fn(),
    setVolume: jest.fn(),
    addListener: jest.fn(),
    configure: jest.fn(),
  },
}));

jest.mock('@anuradev/capacitor-background-mode', () => ({
  BackgroundMode: {
    enable: jest.fn(),
    disable: jest.fn(),
    checkNotificationsPermission: jest.fn(),
    requestNotificationsPermission: jest.fn(),
    updateNotification: jest.fn(),
    addListener: jest.fn(),
  },
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  getBaseURL: jest.fn(() => 'http://localhost:3000'),
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
