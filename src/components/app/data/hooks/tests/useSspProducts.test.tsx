import { getConfig } from '@edx/frontend-platform/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';

import useSspProducts from '@/components/app/data/hooks/useSspProducts';
import { fetchSspProducts } from '@/components/app/data/services/ssp-products';

// Mock dependencies
jest.mock('axios');
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ENTERPRISE_ACCESS_BASE_URL: 'https://api.mocked-url.com',
  })),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper function to wrap custom hook renders in a TanStack Query Provider wrapper context
const createQueryClientWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function QueryClientWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('fetchSspProducts Service & useSspProducts Hook Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSspProducts Service Layer Unit Testing', () => {
    it('covers successful try block with array data', async () => {
      const mockPayload = [{ name: 'Test Academy', lookupKey: 'test_key' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPayload });

      const result = await fetchSspProducts();

      expect(getConfig).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.mocked-url.com/api/v1/ssp-products/',
        expect.any(Object),
      );
      expect(result.data).toEqual(mockPayload);
    });

    it('handles fallback safely when ENTERPRISE_ACCESS_BASE_URL is missing', async () => {
      (getConfig as jest.Mock).mockReturnValueOnce({ ENTERPRISE_ACCESS_BASE_URL: '' });
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await fetchSspProducts();

      // The base URL evaluates to empty string, making the endpoint fall back to a relative path match
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/ssp-products/', expect.any(Object));
      expect(result.data).toEqual([]);
    });
  });

  describe('useSspProducts React Query Hook Integration Testing', () => {
    it('should cleanly unpack data payload array via select transformer helper', async () => {
      const mockPayload = [
        { name: 'AI Academy', lookupKey: 'ai_key', price: '149.00' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPayload });

      const productKey = 'ai_key';
      const { result } = renderHook(() => useSspProducts(productKey), {
        wrapper: createQueryClientWrapper(),
      });

      // Initially loading lifecycle verification
      expect(result.current.isLoading).toBe(true);

      // Await react-query serialization update processing
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verifies select transformer extracted response.data cleanly as a flat array
      expect(result.current.data).toEqual(mockPayload);
    });

    it('should fall back to an empty array securely if query payload is missing data key', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      const productKey = 'ai_key';
      const { result } = renderHook(() => useSspProducts(productKey), {
        wrapper: createQueryClientWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('should forward network exception error codes cleanly', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('500 Server Error'));

      const productKey = 'ai_key';
      const { result } = renderHook(() => useSspProducts(productKey), {
        wrapper: createQueryClientWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });
});
