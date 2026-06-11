import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import {
  fetchTestimonials,
  pickNextTestimonial,
} from '../useTestimonials';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  getAuthenticatedUser: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('@edx/frontend-platform/utils', () => ({
  camelCaseObject: jest.fn((obj) => obj),
}));

describe('fetchTestimonials', () => {
  const baseUrl = 'https://enterprise-access.example.com';
  const endpoint = `${baseUrl}/api/v1/testimonials/`;
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue({
      ENTERPRISE_ACCESS_BASE_URL: baseUrl,
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });
  });

  it('returns only active API testimonials', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          {
            uuid: '1',
            quote_text: 'Active quote',
            attribution_name: 'Alex',
            attribution_title: 'Director',
            isActive: true,
          },
          {
            uuid: '2',
            quote_text: 'Inactive quote',
            attribution_name: 'Pat',
            attribution_title: 'Manager',
            isActive: false,
          },
        ],
      },
    });

    const result = await fetchTestimonials();

    expect(mockGet).toHaveBeenCalledWith(endpoint);
    expect(result).toEqual([
      {
        uuid: '1',
        quote_text: 'Active quote',
        attribution_name: 'Alex',
        attribution_title: 'Director',
        is_active: true,
      },
    ]);
  });

  it('uses getAuthenticatedHttpClient for API requests', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          {
            uuid: '3',
            quote_text: 'Public quote',
            attribution_name: 'Jordan',
            attribution_title: 'Lead',
          },
        ],
      },
    });

    const result = await fetchTestimonials();

    expect(getAuthenticatedHttpClient).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(endpoint);
    expect(result).toHaveLength(1);
  });

  it('returns an empty array when API results are missing or malformed', async () => {
    mockGet.mockResolvedValue({ data: { results: null } });

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
  });

  it('throws when request fails', async () => {
    mockGet.mockRejectedValue(new Error('network'));

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
  });

  it('supports non-paginated array payload shape', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          uuid: '4',
          quote_text: 'Array payload quote',
          attribution_name: 'Robin',
          attribution_title: 'Engineer',
          isActive: true,
        },
      ],
    });

    const result = await fetchTestimonials();

    expect(result).toEqual([
      {
        uuid: '4',
        quote_text: 'Array payload quote',
        attribution_name: 'Robin',
        attribution_title: 'Engineer',
        is_active: true,
      },
    ]);
  });

  it('returns empty and avoids request when base URL is not set', async () => {
    (getConfig as jest.Mock).mockReturnValue({
      ENTERPRISE_ACCESS_BASE_URL: undefined,
    });

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('filters malformed testimonial entries to prevent empty cards', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          null,
          {
            uuid: 'good-1',
            quoteText: 'Good quote',
            attributionName: 'Casey',
            attributionTitle: 'Manager',
            isActive: true,
          },
          {
            uuid: 'bad-1',
            quoteText: '',
            attributionName: 'No quote',
            attributionTitle: 'Title',
            isActive: true,
          },
        ],
      },
    });

    const result = await fetchTestimonials();

    expect(result).toEqual([
      {
        uuid: 'good-1',
        quote_text: 'Good quote',
        attribution_name: 'Casey',
        attribution_title: 'Manager',
        is_active: true,
      },
    ]);
  });
});

describe('pickNextTestimonial', () => {
  const testimonials = [
    {
      uuid: 'a',
      quote_text: 'Quote A',
      attribution_name: 'A',
      attribution_title: 'Role A',
    },
    {
      uuid: 'b',
      quote_text: 'Quote B',
      attribution_name: 'B',
      attribution_title: 'Role B',
    },
    {
      uuid: 'c',
      quote_text: 'Quote C',
      attribution_name: 'C',
      attribution_title: 'Role C',
    },
  ];

  it('does not repeat testimonials until all have been shown', () => {
    const shown = new Set<string>();

    const first = pickNextTestimonial(testimonials, shown);
    const second = pickNextTestimonial(testimonials, shown);
    const third = pickNextTestimonial(testimonials, shown);

    const uuids = [first?.uuid, second?.uuid, third?.uuid].filter(Boolean);
    expect(new Set(uuids).size).toBe(3);
    expect(shown.size).toBe(3);
  });

  it('resets shown set after pool exhaustion and continues rotation', () => {
    const shown = new Set<string>(['a', 'b', 'c']);
    const next = pickNextTestimonial(testimonials, shown);

    expect(next).not.toBeNull();
    expect(shown.size).toBe(1);
    expect(shown.has(next?.uuid || '')).toBe(true);
  });
});
