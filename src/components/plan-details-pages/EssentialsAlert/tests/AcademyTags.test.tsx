import { render, screen } from '@testing-library/react';

import AcademyTags from '../AcademyTags';

describe('AcademyTags Component', () => {
  it('renders nothing when tags is an empty array', () => {
    const { container } = render(<AcademyTags tags={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders tag titles', () => {
    render(<AcademyTags tags={[{ id: 1, title: 'sustainability' }]} />);
    expect(screen.getByText('sustainability')).toBeInTheDocument();
  });

  it('renders tags in the supplied order', () => {
    const { container } = render(
      <AcademyTags
        tags={[
          { id: 1, title: 'sustainability' },
          { id: 2, title: 'strategy' },
          { id: 3, title: 'leadership' },
        ]}
      />,
    );
    const labels = Array.from(container.querySelectorAll('.essentials-alert__tag')).map(
      (el) => el.textContent,
    );
    expect(labels).toEqual(['sustainability', 'strategy', 'leadership']);
  });

  it('renders multiple tags with the expected structure and classes', () => {
    const { container } = render(
      <AcademyTags
        tags={[
          { id: 1, title: 'sustainability' },
          { id: 2, title: 'strategy' },
        ]}
      />,
    );
    expect(container.querySelector('ul.essentials-alert__tags')).toBeInTheDocument();
    const items = container.querySelectorAll('li.essentials-alert__tag');
    expect(items).toHaveLength(2);
  });

  it('renders only the first 3 tags when more than 3 are provided', () => {
    const tags = [
      { id: 1, title: 'sustainability' },
      { id: 2, title: 'strategy' },
      { id: 3, title: 'leadership' },
      { id: 4, title: 'engineering' },
      { id: 5, title: 'marketing' },
    ];

    const { container } = render(<AcademyTags tags={tags} />);

    const items = container.querySelectorAll('li.essentials-alert__tag');
    expect(items).toHaveLength(3);

    expect(screen.getByText('sustainability')).toBeInTheDocument();
    expect(screen.getByText('strategy')).toBeInTheDocument();
    expect(screen.getByText('leadership')).toBeInTheDocument();

    expect(screen.queryByText('engineering')).not.toBeInTheDocument();
    expect(screen.queryByText('marketing')).not.toBeInTheDocument();
  });
});
