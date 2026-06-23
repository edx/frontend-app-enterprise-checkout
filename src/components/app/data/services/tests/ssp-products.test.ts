import { getConfig } from '@edx/frontend-platform/config';
import axios from 'axios';

import { fetchSspProducts, SspProduct } from '../ssp-products';

// Mock the dependencies
jest.mock('axios');
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ENTERPRISE_ACCESS_BASE_URL: 'https://api.mocked-url.com',
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchSspProducts Service Layer API Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a successful GET request to the correct endpoint with transformer configurations', async () => {
    const mockProducts: SspProduct[] = [
      {
        name: 'Sustainability',
        longName: 'Sustainability Academy',
        description: 'Sustainability strategy overview.',
        marketingUrl: 'https://www.edx.org/learn/sustainability',
        thumbnailUrl: 'https://example.com/image.png',
        price: '149.00',
        lookupKey: 'essentials_sustainability',
        slug: 'sustainability-academy',
        courseCount: 12,
      },
    ];

    // Mock the axios get resolution payload wrapper structural context
    const mockAxiosResponse = {
      data: mockProducts,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    mockedAxios.get.mockResolvedValueOnce(mockAxiosResponse);

    const result = await fetchSspProducts();

    // Verify the platform config layer is invoked properly
    expect(getConfig).toHaveBeenCalled();

    // Verify the HTTP request hits the exact absolute destination including trailing slash
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.mocked-url.com/api/v1/ssp-products/',
      expect.objectContaining({
        transformResponse: expect.any(Array),
      }),
    );

    // Verify the unpacked outcome payload resolves correctly
    expect(result.data).toEqual(mockProducts);
    expect(result.status).toBe(200);
  });

  it('should forward network rejection errors gracefully when the backend fails', async () => {
    const mockNetworkError = new Error('500 Internal Server Error');
    mockedAxios.get.mockRejectedValueOnce(mockNetworkError);

    // Assert that the native promise rejection maps directly up to the call site
    await expect(fetchSspProducts()).rejects.toThrow('500 Internal Server Error');
  });

  it('should append custom parsing rules correctly onto default Axios response transformers', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    await fetchSspProducts();

    // Captures the configuration options passed into the underlying Axios instance call site
    const passedRequestConfig = mockedAxios.get.mock.calls[0][1];

    expect(passedRequestConfig).toBeDefined();
    expect(Array.isArray(passedRequestConfig?.transformResponse)).toBe(true);
    // Verifies that at least our custom mapping utility was appended onto the transformer pipe array
    expect(passedRequestConfig?.transformResponse?.length).toBeGreaterThanOrEqual(1);
  });
});
