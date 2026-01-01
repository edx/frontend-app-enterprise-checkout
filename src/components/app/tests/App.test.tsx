import { render, screen } from '@testing-library/react';
import React, { act } from 'react';

import '@testing-library/jest-dom';

import App from '../App';

jest.mock('../routes', () => ({
  createAppRouter: jest.fn(() => ({
    state: {},
    routes: [],
  })),
  RouterFallback: () => <div data-testid="router-fallback" />,
}));

jest.mock('react-router-dom', () => ({
  RouterProvider: ({ fallbackElement }: any) => (
    <div data-testid="router-provider">
      {fallbackElement}
    </div>
  ),
}));

jest.mock('@edx/frontend-platform/react', () => ({
  AppProvider: ({ children }: any) => (
    <div data-testid="app-provider">{children}</div>
  ),
}));

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => (
    <div data-testid="react-query-devtools" />
  ),
}));

jest.mock('@tanstack/react-query-devtools/production', () => ({
  ReactQueryDevtools: () => (
    <div data-testid="react-query-devtools-production" />
  ),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders App and core providers', () => {
    render(<App />);

    expect(screen.getByTestId('app-provider')).toBeInTheDocument();
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
    expect(screen.getByTestId('router-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();
  });

  it('creates the app router', () => {
    // eslint-disable-next-line global-require
    const { createAppRouter } = require('../routes');

    render(<App />);

    expect(createAppRouter).toHaveBeenCalledTimes(1);
    expect(createAppRouter).toHaveBeenCalledWith(expect.any(Object));
  });

  it('attaches toggleReactQueryDevtools to window', () => {
    render(<App />);

    expect(
      (window as any).toggleReactQueryDevtools,
    ).toBeInstanceOf(Function);
  });

  it('toggles production ReactQueryDevtools when toggle function is called', async () => {
    render(<App />);

    expect(
      screen.queryByTestId('react-query-devtools-production'),
    ).not.toBeInTheDocument();

    await act(async () => {
      (window as any).toggleReactQueryDevtools();
    });

    expect(
      await screen.findByTestId('react-query-devtools-production'),
    ).toBeInTheDocument();

    await act(async () => {
      (window as any).toggleReactQueryDevtools();
    });

    expect(
      screen.queryByTestId('react-query-devtools-production'),
    ).not.toBeInTheDocument();
  });
});
