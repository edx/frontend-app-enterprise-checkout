import { Icon, PageBanner } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { ReactNode } from 'react';

interface SystemWideWarningBannerProps {
  children: ReactNode;
}

const SystemWideWarningBanner = ({ children }: SystemWideWarningBannerProps) => (
  <PageBanner variant="warning">
    <Icon src={WarningFilled} className="mr-2" />
    {children}
  </PageBanner>
);

export default SystemWideWarningBanner;
