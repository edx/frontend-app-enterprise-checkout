import { getConfig } from '@edx/frontend-platform/config';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';
import {
  Alert, Button, Card,
} from '@openedx/paragon';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DisplayPrice } from '@/components/DisplayPrice';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import './essentials-alert.scss';
import { extractPriceByProductLookupKey } from '@/utils/checkout';

const EssentialsAlert = () => {
  const {
    ESSENTIALS_PRODUCT_URL,
    TEAMS_PRODUCT_URL,
  } = getConfig();

  const { authenticatedUser }: AppContextValue = useContext(AppContext);

  // Read the entire selected product stored by the root loader
  const academySelectionData = useCheckoutFormStore(
    (state) => state.formData[DataStoreKey.AcademySelection],
  );

  const product = academySelectionData?.selectedProduct;
  const { data: bffPrice } = useBFFContext(authenticatedUser?.userId ?? null, {
    select: (contextData): number | null => extractPriceByProductLookupKey(contextData?.pricing, product?.lookupKey),
  });

  if (!product) {
    return null;
  }
  const productPrice = product.price
    ? Number.parseFloat(product.price)
    : null;
  const displayPrice = productPrice ?? bffPrice ?? null;

  const academyName = product.longName || product.name || '';
  const academyDescription = product.description || '';
  const academyMarketingUrl = product.marketingUrl ?? '';
  const courseCount = product.courseCount ?? 0;

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
