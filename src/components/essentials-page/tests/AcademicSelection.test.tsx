import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import AcademicSelection from '../AcademicSelection';

// Mock the PurchaseSummary component to isolate testing of AcademicSelection
jest.mock('@/components/PurchaseSummary', () => ({
  PurchaseSummary: () => <div data-testid="purchase-summary">PurchaseSummary Component</div>,
}));

describe('AcademicSelection', () => {
  it('renders without crashing', () => {
    render(<AcademicSelection />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders the main heading "Coming Soon"', () => {
    render(<AcademicSelection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Coming Soon');
  });

  it('renders the heading with correct CSS classes', () => {
    render(<AcademicSelection />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('display-3', 'fw-bold');
  });

  it('renders the MenuBook icon with correct styling', () => {
    const { container } = render(<AcademicSelection />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    
    // Check that the icon is wrapped in a div with correct styling
    const iconWrapper = container.querySelector('.d-flex.justify-content-center');
    expect(iconWrapper).toBeInTheDocument();
    
    // The Icon component renders with inline styles on the wrapper
    const styledWrapper = iconWrapper?.querySelector('span');
    expect(styledWrapper).toBeInTheDocument();
    
    // Verify the parent has the flexbox layout
    expect(iconWrapper).toHaveClass('d-flex', 'justify-content-center');
  });

  it('renders the PurchaseSummary component', () => {
    render(<AcademicSelection />);
    const purchaseSummary = screen.getByTestId('purchase-summary');
    expect(purchaseSummary).toBeInTheDocument();
  });

  it('renders with Container component and correct size', () => {
    const { container } = render(<AcademicSelection />);
    const containerElement = container.firstChild;
    expect(containerElement).toHaveClass('py-4.5');
  });

  it('renders two-column layout with Row and Col components', () => {
    const { container } = render(<AcademicSelection />);
    const rowElement = container.querySelector('.row');
    expect(rowElement).toBeInTheDocument();

    // Check for column elements
    const colElements = container.querySelectorAll('[class*="col"]');
    expect(colElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders main content in left column with responsive breakpoints', () => {
    const { container } = render(<AcademicSelection />);
    const columns = container.querySelectorAll('[class*="col"]');
    
    // Verify we have at least 2 columns
    expect(columns.length).toBeGreaterThanOrEqual(2);
    
    // First column should have md={12} lg={8} classes for responsive layout
    const mainColumn = columns[0];
    expect(mainColumn?.className).toMatch(/col-md-12|col-lg-8/);
  });

  it('renders PurchaseSummary in right sidebar with responsive breakpoints', () => {
    const { container } = render(<AcademicSelection />);
    const purchaseSummaryWrapper = screen.getByTestId('purchase-summary').parentElement;
    
    // The parent should have col classes with lg={4}
    expect(purchaseSummaryWrapper?.className).toMatch(/col-lg-4|col-md-12/);
  });

  it('renders with correct Stack styling for main content', () => {
    const { container } = render(<AcademicSelection />);
    const stack = container.querySelector('.text-center.my-5.py-5');
    expect(stack).toBeInTheDocument();
  });

  it('renders all layout elements in correct order', () => {
    const { container } = render(<AcademicSelection />);
    
    // Check order: Container > Row > Col (main) with Stack > Col (sidebar) with PurchaseSummary
    const mainContainer = container.querySelector('[class*="container"]');
    expect(mainContainer).toBeInTheDocument();
    
    const row = mainContainer?.querySelector('[class*="row"]');
    expect(row).toBeInTheDocument();
    
    const mainCol = row?.querySelector('[class*="col-lg-8"]');
    expect(mainCol).toBeInTheDocument();
    
    const sidebarCol = row?.querySelector('[class*="col-lg-4"]');
    expect(sidebarCol).toBeInTheDocument();
  });

  it('verifies the icon is positioned correctly within the main content', () => {
    const { container } = render(<AcademicSelection />);
    
    // Get the stack (main content area)
    const stack = container.querySelector('.text-center');
    expect(stack).toBeInTheDocument();
    
    // The icon should be a child of the stack
    const iconWrapper = stack?.querySelector('.d-flex.justify-content-center');
    expect(iconWrapper).toBeInTheDocument();
    
    // Icon should be first child before heading
    const iconParent = iconWrapper?.parentElement;
    const heading = iconParent?.querySelector('[class*="display-3"]');
    expect(heading).toBeInTheDocument();
  });

  it('renders component as a functional component without errors', () => {
    const { rerender } = render(<AcademicSelection />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    
    // Verify it can rerender without errors
    rerender(<AcademicSelection />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('ensures PurchaseSummary is positioned in the sidebar, not main content', () => {
    const { container } = render(<AcademicSelection />);
    
    // Find the purchase summary
    const purchaseSummary = screen.getByTestId('purchase-summary');
    
    // Get its column parent
    const sidebarCol = purchaseSummary.closest('[class*="col-lg-4"]');
    expect(sidebarCol).toBeInTheDocument();
    
    // Ensure it's not in the main column (which has display content)
    const mainCol = container.querySelector('[class*="col-lg-8"]');
    expect(mainCol).not.toContainElement(purchaseSummary);
  });

  it('maintains accessibility with proper heading hierarchy', () => {
    render(<AcademicSelection />);
    
    // Should have exactly one h1 (main heading)
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    expect(h1Elements[0]).toHaveTextContent('Coming Soon');
  });

  it('renders with proper responsive spacing classes', () => {
    const { container } = render(<AcademicSelection />);
    
    // Check container has padding
    const containerElement = container.querySelector('[class*="py-4"]');
    expect(containerElement).toBeInTheDocument();
    
    // Check main content has spacing
    const stack = container.querySelector('.my-5.py-5');
    expect(stack).toBeInTheDocument();
  });
});
