import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext, type AppContextValue } from '@edx/frontend-platform/react';
import {
  Alert, Button, Card,
} from '@openedx/paragon';
import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DisplayPrice } from '@/components/DisplayPrice';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';
import { extractPriceObject } from '@/utils/checkout';

import {
  findEssentialsAcademy,
  getDefaultEssentialsAcademy,
} from './data/mockEssentialsAcademyProducts';

import './essentials-alert.scss';

// Constants for URLs and default values
const PICK_DIFFERENT_ACADEMY_URL = 'https://business.edx.org/course-library-plans-essentials/';
const SWITCH_TO_TEAMS_URL = 'https://business.edx.org/academy/tech-digital-transformation/';

const DEFAULT_ACADEMY_DATA = getDefaultEssentialsAcademy();
const ESSENTIALS_PRICE_FALLBACK = DEFAULT_ACADEMY_DATA.price
  ? DEFAULT_ACADEMY_DATA.price.unitAmount / 100
  : 149;

const EssentialsAlert = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const planDetailsData = useCheckoutFormStore((state) => state.formData[DataStoreKey.PlanDetails]);
  const [searchParams] = useSearchParams();

  const { data: bffContext } = useBFFContext(authenticatedUser?.userId ?? null);
  const priceObject = bffContext?.pricing ? extractPriceObject(bffContext.pricing) : null;

  const academyData = findEssentialsAcademy({
    academyName: planDetailsData?.academyName,
    lookupKey: searchParams.get('product_key') ?? priceObject?.lookupKey ?? bffContext?.pricing?.defaultByLookupKey ?? null,
    priceId: planDetailsData?.stripePriceId ?? priceObject?.id ?? null,
  }) ?? DEFAULT_ACADEMY_DATA;

  const displayPrice = academyData.price
    ? academyData.price.unitAmount / 100
    : (priceObject ? priceObject.unitAmount / 100 : ESSENTIALS_PRICE_FALLBACK);

  return (
    <Alert data-testid="essentials-alert" className="essentials-alert m-0">
      {/* Top row: Title and Price */}
      <div className="essentials-alert__header">
        <h3 className="essentials-alert__title">
          <FormattedMessage
            id="checkout.essentialsAlert.title"
            defaultMessage="Essentials Plan"
            description="Title for the essentials subscription alert"
          />
        </h3>
        {displayPrice != null && (
          <div className="essentials-alert__price-wrapper">
            <h3 className="essentials-alert__price-text">
              <span className="font-weight-light">
                <FormattedMessage
                  id="checkout.essentialsAlert.from"
                  defaultMessage="From"
                  description="Text indicating the starting price of a subscription"
                />
              </span>{' '}
              <DisplayPrice value={displayPrice} />
              <span className="font-weight-light">
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

      {/* Middle section: Description, link, and card */}
      <div className="essentials-alert__body">
        <p className="h4 essentials-alert__subtitle font-weight-light my-3">
          <FormattedMessage
            id="checkout.essentialsAlert.description"
            defaultMessage="You have picked {academyName} as your focus area. Changed your mind?"
            description="Description showing selected academy for essentials plan"
            values={{ academyName: academyData.name }}
          />
        </p>
        <Button
          variant="link"
          href={PICK_DIFFERENT_ACADEMY_URL}
          className="essentials-alert__link"
        >
          <FormattedMessage
            id="checkout.essentialsAlert.pickDifferentAcademy"
            defaultMessage="Pick a different academy"
            description="Link to pick a different academy"
          />
        </Button>

        {/* Academy Details Card - Full width */}
        <Card className="essentials-alert__card">
          <Card.Body>
            {/* Academy Name and Course Count */}
            <div className="essentials-alert__academy-header">
              <h4 className="essentials-alert__academy-name">{academyData.name}</h4>
              {academyData.courseCount != null && (
                <span className="essentials-alert__course-badge">
                  <FormattedMessage
                    id="checkout.essentialsAlert.courseCount"
                    defaultMessage="{count} courses"
                    description="Number of courses in academy"
                    values={{ count: academyData.courseCount }}
                  />
                </span>
              )}
              {academyData.marketingUrl && (
                <Button
                  variant="link"
                  href={academyData.marketingUrl}
                  className="essentials-alert__learn-more"
                >
                  <FormattedMessage
                    id="checkout.essentialsAlert.learnMore"
                    defaultMessage="Learn more"
                    description="Link to learn more about the academy"
                  />
                </Button>
              )}
            </div>

            {academyData.tags.length > 0 && (
              <div className="essentials-alert__tags">
                {academyData.tags.map((tag, index) => (
                  <span key={tag} className="essentials-alert__tag">
                    {tag}
                    {index < academyData.tags.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            )}

            {academyData.description && (
              <p className="essentials-alert__description">
                {academyData.description}
              </p>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Footer Upsell - Darker red section */}
      <div className="essentials-alert__footer-section">
        <p className="essentials-alert__footer mb-0">
          <FormattedMessage
            id="checkout.essentialsAlert.upsell"
            defaultMessage="Need to upskill your team in more than one focus area? {switchToTeamsLink}"
            description="Upsell message for switching to Teams plan"
            values={{
              switchToTeamsLink: (
                <Button
                  variant="link"
                  href={SWITCH_TO_TEAMS_URL}
                  className="essentials-alert__footer-link"
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
