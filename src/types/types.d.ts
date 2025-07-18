import { LoaderFunction } from 'react-router-dom';

type MakeRouteLoaderFunction = (queryClient?: QueryClient) => LoaderFunction;
type MakeRouteLoaderFunctionWithQueryClient = (queryClient: QueryClient) => LoaderFunction;

export {};
