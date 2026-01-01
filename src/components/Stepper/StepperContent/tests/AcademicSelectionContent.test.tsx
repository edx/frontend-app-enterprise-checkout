/* eslint-disable import/order */
import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { AppContext } from '@edx/frontend-platform/react';

import AcademicSelectionContent from '../AcademicSelectionContent';

jest.mock('@/components/TermsAndConditionsText', () => ({
  TermsAndConditionsText: () => (
    <div data-testid="terms-and-conditions" />
  ),
}));

describe('AcademicSelectionContent', () => {
  const renderWithContext = (contextValue: any) => render(
    <AppContext.Provider value={contextValue}>
      <AcademicSelectionContent />
    </AppContext.Provider>,
  );

  it('renders authenticated user email when authenticatedUser exists', () => {
    renderWithContext({
      authenticatedUser: {
        email: 'testuser@example.com',
      },
    });

    expect(
      screen.getByText('Logged in as testuser@example.com'),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('terms-and-conditions'),
    ).toBeInTheDocument();
  });

  it('does NOT render email paragraph when authenticatedUser is null', () => {
    renderWithContext({
      authenticatedUser: null,
    });

    expect(
      screen.queryByText(/Logged in as/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId('terms-and-conditions'),
    ).toBeInTheDocument();
  });

  it('does NOT render email paragraph when authenticatedUser is undefined', () => {
    renderWithContext({
      authenticatedUser: undefined,
    });

    expect(
      screen.queryByText(/Logged in as/i),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId('terms-and-conditions'),
    ).toBeInTheDocument();
  });

  it('handles authenticatedUser object without email safely', () => {
    renderWithContext({
      authenticatedUser: {},
    });

    expect(
      screen.getByText('Logged in as'),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId('terms-and-conditions'),
    ).toBeInTheDocument();
  });
});
