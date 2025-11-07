import {
  getAuthenticatedHttpClient, getAuthenticatedUser,
} from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { queryOptions, useQuery } from '@tanstack/react-query';

import useCheckoutIntent from '@/components/app/data/hooks/useCheckoutIntent';
import { queryCheckoutIntent } from '@/components/app/data/queries/queries';

export const lmsLoginRefresh = async () => {
  const { LMS_BASE_URL } = getConfig();
  const url = `${LMS_BASE_URL}/login_refresh`;
  const response = await getAuthenticatedHttpClient().post(url);
  return camelCaseObject(response.data);
};

const usePolledCheckoutIntent = () => {
  const { data: checkoutIntent } = useCheckoutIntent();

  // TODO: If we decide to go this route, disable polling by validating the users roles for enterprise_admin
  // Include we want to refresh jwt roles and permissions
  // useQuery({
  //   queryKey: ['authUser'],
  //   queryFn: lmsLoginRefresh,
  //   // tuning optional
  //   refetchOnWindowFocus: true,
  //   refetchInterval: 5000,
  //   enabled: !!checkoutIntent?.id,
  // });

  return useQuery(
    queryOptions({
      ...queryCheckoutIntent(checkoutIntent?.id!),
      enabled: !!checkoutIntent?.id,
      // Runs synchronously; closes over `user`
      refetchInterval: (q) => {
        const user = getAuthenticatedUser();
        const fulfilled = q.state.data?.state === 'fulfilled';
        return fulfilled && user?.isActive ? false : 5000;
      },
    }),
  );
};

export default usePolledCheckoutIntent;
