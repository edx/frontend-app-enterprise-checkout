import { getConfig } from '@edx/frontend-platform/config';
import axios from 'axios';

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

jest.mock('axios');

describe('fetchTestimonials', () => {
  const baseUrl = 'https://enterprise-access.example.com';
  const endpoint = `${baseUrl}/api/v1/testimonials/`;

  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue({
      ENTERPRISE_ACCESS_BASE_URL: baseUrl,
      TESTIMONIALS_API_BASE_URL: baseUrl,
      TESTIMONIALS_API_USE_RELATIVE_PATH: null,
      TESTIMONIALS_API_PROXY_TARGET: null,
    });
  });

  it('returns only active API testimonials', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        results: [
          {
            uuid: '1',
            quote_text: 'Active quote',
            attribution_name: 'Alex',
            attribution_title: 'Director',
            is_active: true,
          },
          {
            uuid: '2',
            quote_text: 'Inactive quote',
            attribution_name: 'Pat',
            attribution_title: 'Manager',
            is_active: false,
          },
        ],
      },
    });

    const result = await fetchTestimonials();

    expect(axios.get).toHaveBeenCalledWith(endpoint);
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

  it('uses axios for public-read requests', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
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

    expect(axios.get).toHaveBeenCalledWith(endpoint);
    expect(result).toHaveLength(1);
  });

  it('returns an empty array when API results are missing or malformed', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { results: null } });

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
  });

  it('returns an empty array when request fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('network'));

    const result = await fetchTestimonials();

    expect(result).toEqual([]);
  });

  it('supports non-paginated array payload shape', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [
        {
          uuid: '4',
          quote_text: 'Array payload quote',
          attribution_name: 'Robin',
          attribution_title: 'Engineer',
          is_active: true,
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

  it('uses relative testimonials API path when enabled', async () => {
    (getConfig as jest.Mock).mockReturnValue({
      ENTERPRISE_ACCESS_BASE_URL: baseUrl,
      TESTIMONIALS_API_BASE_URL: null,
      TESTIMONIALS_API_USE_RELATIVE_PATH: 'true',
      TESTIMONIALS_API_PROXY_TARGET: 'http://127.0.0.1:8000',
    });
    (axios.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

    await fetchTestimonials();

    expect(axios.get).toHaveBeenCalledWith('/api/v1/testimonials/');
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
