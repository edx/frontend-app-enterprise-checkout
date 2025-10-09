import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import '@testing-library/jest-dom';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => render(
    <IntlProvider locale="en">
      <BrowserRouter>
        <ErrorPage {...props} />
      </BrowserRouter>
    </IntlProvider>,
  );

  it('Renders the error correctly', () => {
    renderComponent();
    expect(screen.getByText("We're sorry, something went wrong")).toBeInTheDocument();
  });

  it('Renders in a message when supplied', () => {
    const props = {
      message: '420: Chill out dude',
    };
    renderComponent(props);
    expect(screen.getByText(props.message)).toBeInTheDocument();
  });
});
