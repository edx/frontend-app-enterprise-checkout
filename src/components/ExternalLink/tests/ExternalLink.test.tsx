import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import ExternalLink from '../ExternalLink';

const renderWithIntl = (ui: React.ReactElement) => render(<IntlProvider locale="en">{ui}</IntlProvider>);
describe('ExternalLink', () => {
  describe('hyperlink variant (default)', () => {
    it('renders as an <a> tag', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a');
      expect(link).toBeInTheDocument();
      expect(link?.tagName).toBe('A');
    });

    it('renders with correct href', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.href).toBe('https://example.com/');
    });

    it('opens in a new tab with target="_blank"', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.target).toBe('_blank');
    });

    it('has rel="noopener noreferrer"', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    });

    it('applies className correctly', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" className="my-custom-class">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveClass('my-custom-class');
      expect(link).toHaveClass('pgn__hyperlink');
    });

    it('renders launch icon', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a');
      const icon = link?.querySelector('.pgn__icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" dataTestId="my-link">
          Click here
        </ExternalLink>,
      );
      expect(screen.getByTestId('my-link')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com">
          <span>Custom child</span>
        </ExternalLink>,
      );
      expect(screen.getByText('Custom child')).toBeInTheDocument();
    });

    it('renders without className when not provided', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveClass('pgn__hyperlink');
    });
  });

  describe('button variant', () => {
    it('renders as a Paragon Button', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('btn');
    });

    it('renders with correct href', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.href).toBe('https://example.com/');
    });

    it('opens in a new tab with target="_blank"', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.target).toBe('_blank');
    });

    it('has rel="noopener noreferrer"', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a') as HTMLAnchorElement;
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    });

    it('applies default buttonVariant="light"', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveClass('btn-light');
    });

    it('applies custom buttonVariant', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button" buttonVariant="outline-primary">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveClass('btn-outline-primary');
    });

    it('applies className correctly', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button" className="w-100">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveClass('w-100');
    });

    it('renders launch icon', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      const icon = link?.querySelector('.pgn__icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders with data-testid', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button" dataTestId="my-button">
          Click here
        </ExternalLink>,
      );
      expect(screen.getByTestId('my-button')).toBeInTheDocument();
    });

    it('renders iconBefore when provided', () => {
      const MockIcon = () => <svg data-testid="mock-icon" />;
      renderWithIntl(
        <ExternalLink
          href="https://example.com"
          variant="button"
          iconBefore={MockIcon as React.ComponentType<{}>}
          iconBeforeStyle={{ color: 'red' }}
        >
          Click here
        </ExternalLink>,
      );
      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('does not render iconBefore when not provided', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com" variant="button">
          Click here
        </ExternalLink>,
      );
      // Only the launch icon should be present, not an extra iconBefore
      const icons = screen.getByText('Click here').closest('a')?.querySelectorAll('.pgn__icon');
      expect(icons?.length).toBe(1);
    });

    it('applies style prop correctly', () => {
      renderWithIntl(
        <ExternalLink
          href="https://example.com"
          variant="button"
          style={{ color: 'red' }}
        >
          Click here
        </ExternalLink>,
      );
      const link = screen.getByText('Click here').closest('a');
      expect(link).toHaveStyle({ color: 'red' });
    });
  });

  describe('common behavior', () => {
    it('defaults to hyperlink variant when variant is not specified', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Click here</ExternalLink>);
      const link = screen.getByText('Click here').closest('a');
      expect(link).not.toHaveClass('btn');
      expect(link).toHaveClass('pgn__hyperlink');
    });

    it('renders plain text children', () => {
      renderWithIntl(<ExternalLink href="https://example.com">Plain text</ExternalLink>);
      expect(screen.getByText('Plain text')).toBeInTheDocument();
    });

    it('renders React node children', () => {
      renderWithIntl(
        <ExternalLink href="https://example.com">
          <strong>Bold text</strong>
        </ExternalLink>,
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });
  });
});
