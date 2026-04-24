import { isEssentialsFlow } from '@/utils/common';

import EssentialsPurchaseSummary from './EssentialsPurchaseSummary';
import TeamsPurchaseSummary from './TeamsPurchaseSummary';

const PurchaseSummary = () => {
  const isEssentials = isEssentialsFlow();

  return isEssentials
    ? <EssentialsPurchaseSummary />
    : <TeamsPurchaseSummary />;
};

export default PurchaseSummary;
