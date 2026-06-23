import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext, type AppContextValue } from '@edx/frontend-platform/react';
import {
  Alert, Button, Card, Spinner,
} from '@openedx/paragon';
import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import useSspProducts from '@/components/app/data/hooks/useSspProducts';
import { DisplayPrice } from '@/components/DisplayPrice';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import './essentials-alert.scss';

const ESSENTIALS_PRICE_FALLBACK = 149;
const DEFAULT_PRODUCT_KEY = 'essentials_artificial_intelligence_subscription_license_yearly';

type AcademySelectionData = {
  academyName?: string;
  academyPrice?: number;
};

const EssentialsAlert = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const {
    ESSENTIALS_PRODUCT_URL,
    TEAMS_PRODUCT_URL,
  } = getConfig();
  const academySelectionData = useCheckoutFormStore(
    (state) => (state.formData as Record<string, AcademySelectionData>)[DataStoreKey.AcademySelection],
  );
  const setFormData = useCheckoutFormStore((state) => state.setFormData);

  const { data: pricePerYear } = useBFFContext(
    authenticatedUser?.userId ?? null,
    {
      select: (): number => ESSENTIALS_PRICE_FALLBACK,
    },
  );

  const { data: sspProducts = [], isLoading } = useSspProducts();

  const selectedAcademyName = academySelectionData?.academyName?.toString().trim() || '';

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const productKeyParam = searchParams.get('product_key') || DEFAULT_PRODUCT_KEY;

  let matchedProduct = sspProducts.find((p) => (p.lookup_key || '') === productKeyParam || (p.slug || '') === productKeyParam);

  if (!matchedProduct && sspProducts.length > 0) {
    matchedProduct = sspProducts.find((p) => {
      const lk = (p.lookup_key || '').toLowerCase();
      const slug = (p.slug || '').toLowerCase();
      const name = (p.name || p.long_name || '').toLowerCase();
      const selected = selectedAcademyName.toLowerCase();
      return lk.startsWith('essentials_') || slug.includes('essentials') || (selected && name.includes(selected));
    }) || sspProducts[0];
  }

  const productPrice = matchedProduct?.price ? Number.parseFloat(matchedProduct.price) : undefined;
  const displayPrice = productPrice ?? ESSENTIALS_PRICE_FALLBACK;

  const academyName = matchedProduct?.long_name || matchedProduct?.name || selectedAcademyName || 'Academy';
  const academyDescription = matchedProduct?.description || '';
  const academyMarketingUrl = matchedProduct?.marketing_url ?? '';
  const courseCount = (matchedProduct as any)?.course_count ?? 0;

  useEffect(() => {
    if (!matchedProduct) { return; }
    const nameToStore = (matchedProduct.long_name || matchedProduct.name || '').toString();
    const productPriceStr = matchedProduct?.price;
    const priceToStore = productPriceStr
      ? Number.parseFloat(productPriceStr)
      : ESSENTIALS_PRICE_FALLBACK;
    const current = academySelectionData?.academyName ?? '';
    const currentPrice = academySelectionData?.academyPrice ?? null;
    if (nameToStore && (current !== nameToStore || currentPrice !== priceToStore)) {
      const selectionPayload = { academyName: nameToStore, academyPrice: priceToStore };
      setFormData(DataStoreKey.AcademySelection, selectionPayload);
    }
  }, [matchedProduct, setFormData, academySelectionData]);

  if (isLoading) {
    return (
      <Alert variant="info" className="d-flex align-items-center justify-content-center p-4 m-0 bg-transparent text-white border-0">
        <Spinner animation="border" variant="light" className="mr-3" screenReaderText="Loading plan details..." />
        <FormattedMessage
          id="checkout.essentialsAlert.loading"
          defaultMessage="Loading plan details..."
          description="Loading text shown while fetching public API plan configurations"
        />
      </Alert>
    );
  }

  return (
    <Alert data-testid="essentials-alert" className="essentials-alert m-0 text-white p-0">
      <div className="essentials-alert__header d-flex justify-content-between align-items-center pt-4 px-4">
        <h3 className="essentials-alert__title font-weight-bold m-0 text-white">
          <FormattedMessage
            id="checkout.essentialsAlert.title"
            defaultMessage="Essentials Plan"
            description="Title for the essentials subscription alert"
          />
        </h3>
        {displayPrice != null && (
          <div className="essentials-alert__price-wrapper d-flex align-items-center justify-content-end text-right">
            <h3 className="essentials-alert__price-text font-weight-bold m-0 text-white">
              <span className="font-weight-normal">
                <FormattedMessage
                  id="checkout.essentialsAlert.from"
                  defaultMessage="From"
                  description="Text indicating the starting price of a subscription"
                />
              </span>{' '}
              <DisplayPrice value={displayPrice} />
              <span className="font-weight-normal">
                <FormattedMessage
                  id="checkout.essentialsAlert.perYear"
                  defaultMessage="/yr"
                  description="Abbreviation for 'per year' in pricing display"
                />
              </span>
            </h3>
          </div>
        )}
      </div>

      <div className="essentials-alert__body pt-0 px-4 pb-4">
        <p className="h4 essentials-alert__subtitle font-weight-normal m-0 text-white my-3">
          <FormattedMessage
            id="checkout.essentialsAlert.descriptionWithLink"
            defaultMessage="You have picked {academyName} as your focus area. Changed your mind? {pickDifferentLink}"
            description="Description showing selected academy for essentials plan with link to change academy"
            values={{
              academyName: <span className="font-weight-bold">{academyName}</span>,
              pickDifferentLink: (
                <Button
                  variant="link"
                  href={ESSENTIALS_PRODUCT_URL}
                  className="essentials-alert__link text-white d-inline-block p-0 mb-0"
                >
                  <FormattedMessage
                    id="checkout.essentialsAlert.pickDifferentAcademy"
                    defaultMessage="Pick a different academy"
                    description="Link to pick a different academy"
                  />
                </Button>
              ),
            }}
          />
        </p>

        <Card className="essentials-alert__card bg-white border-0 m-0 w-100">
          <Card.Body>
            <div className="essentials-alert__academy-header d-flex align-items-center flex-wrap">
              <h4 className="essentials-alert__academy-name m-0 font-weight-bold">{academyName}</h4>
              {courseCount > 0 && (
                <span className="essentials-alert__course-badge">
                  <FormattedMessage
                    id="checkout.essentialsAlert.courseCount"
                    defaultMessage="{count} courses"
                    description="Number of courses in academy"
                    values={{ count: courseCount }}
                  />
                </span>
              )}
              {academyMarketingUrl && (
                <Button
                  variant="link"
                  href={academyMarketingUrl}
                  className="essentials-alert__learn-more ml-auto font-weight-bold"
                >
                  <FormattedMessage
                    id="checkout.essentialsAlert.learnMore"
                    defaultMessage="Learn more"
                    description="Link to learn more about the academy"
                  />
                </Button>
              )}
            </div>

            {academyDescription && (
              <p className="essentials-alert__description m-0 font-weight-normal pt-3">
                {academyDescription}
              </p>
            )}
          </Card.Body>
        </Card>
      </div>

      <div className="essentials-alert__footer-section m-0 p-4">
        <p className="essentials-alert__footer m-0 p-0 bg-transparent border-0 text-white font-weight-normal">
          <FormattedMessage
            id="checkout.essentialsAlert.upsell"
            defaultMessage="Need to upskill your team in more than one focus area? {switchToTeamsLink}"
            description="Upsell message for switching to Teams plan"
            values={{
              switchToTeamsLink: (
                <Button
                  variant="link"
                  href={TEAMS_PRODUCT_URL}
                  className="essentials-alert__footer-link p-0 m-0"
                >
                  <FormattedMessage
                    id="checkout.essentialsAlert.switchToTeams"
                    defaultMessage="Switch to Teams"
                    description="Link to switch to Teams plan"
                  />
                </Button>
              ),
            }}
          />
        </p>
      </div>
    </Alert>
  );
};

export default EssentialsAlert;
