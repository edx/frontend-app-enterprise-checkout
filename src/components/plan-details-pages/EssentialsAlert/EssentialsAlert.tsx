import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext, type AppContextValue } from '@edx/frontend-platform/react';
import {
  Alert, Button, Card,
} from '@openedx/paragon';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DisplayPrice } from '@/components/DisplayPrice';
import { DataStoreKey } from '@/constants/checkout';
import { useCheckoutFormStore } from '@/hooks/useCheckoutFormStore';

import './essentials-alert.scss';

// Constants for URLs and default values
const ESSENTIALS_PRICE_FALLBACK = 149; // Default price in dollars when API is unavailable
const PICK_DIFFERENT_ACADEMY_URL = 'https://business.edx.org/course-library-plans-essentials/';
const SWITCH_TO_TEAMS_URL = 'https://business.edx.org/academy/tech-digital-transformation/';

interface AcademyData {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  courseCount: number;
  marketingUrl: string;
}

/**
* Default academy data for Essentials plan.
* TODO: Replace with dynamic data from API endpoint when available:
* GET {ENTERPRISE_ACCESS_BASE_URL}/api/v1/bffs/academies/{academyId}/
*
* API response fields needed:
* - id: Academy identifier
* - name: Academy name
* - description: Marketing summary
* - tags: Skill tags array
* - courseCount: Number of courses in catalog
* - marketingUrl: Dynamic URL for "Learn more" link
*/
const DEFAULT_ACADEMY_DATA: AcademyData = {
  id: 'artificial-intelligence',
  name: 'Artificial Intelligence',
  description: 'This pathway helps your team build a strong foundation in AI, and equips them to skillfully incorporate AI into existing organizational strategies.',
  tags: ['AI foundations', 'Intermediate AI', 'Advanced AI', 'AI for business'],
  courseCount: 16,
  marketingUrl: 'https://www.edx.org/learn/artificial-intelligence',
};

type AcademySelectionData = {
  academyName?: string;
};

const EssentialsAlert = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);
  const academySelectionData = useCheckoutFormStore(
    (state) => (state.formData as Record<string, AcademySelectionData>)[DataStoreKey.AcademySelection],
  );

  // Fetch pricing from BFF context
  // For Essentials flow, always use $149 per user
  const { data: pricePerYear } = useBFFContext(
    authenticatedUser?.userId ?? null,
    {
      select: (): number => ESSENTIALS_PRICE_FALLBACK,
    },
  );

  // Ensure fallback price displays when API is unavailable (data is undefined during loading/error)
  const displayPrice = pricePerYear ?? ESSENTIALS_PRICE_FALLBACK;

  const academyName = academySelectionData?.academyName?.trim() || DEFAULT_ACADEMY_DATA.name;

  return (
    <Alert data-testid="essentials-alert" className="essentials-alert m-0 text-white p-0">
      {/* Top row: Title and Price */}
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

      {/* Middle section: Description, link, and card */}
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
                  href={PICK_DIFFERENT_ACADEMY_URL}
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

        {/* Academy Details Card - Full width */}
        <Card className="essentials-alert__card bg-white border-0 m-0 w-100">
          <Card.Body>
            {/* Academy Name and Course Count */}
            <div className="essentials-alert__academy-header d-flex align-items-center flex-wrap">
              <h4 className="essentials-alert__academy-name m-0 font-weight-bold">{academyName}</h4>
              <span className="essentials-alert__course-badge">
                <FormattedMessage
                  id="checkout.essentialsAlert.courseCount"
                  defaultMessage="{count} courses"
                  description="Number of courses in academy"
                  values={{ count: DEFAULT_ACADEMY_DATA.courseCount }}
                />
              </span>
              <Button
                variant="link"
                href={DEFAULT_ACADEMY_DATA.marketingUrl}
                className="essentials-alert__learn-more ml-auto font-weight-bold"
              >
                <FormattedMessage
                  id="checkout.essentialsAlert.learnMore"
                  defaultMessage="Learn more"
                  description="Link to learn more about the academy"
                />
              </Button>
            </div>

            {/* Tags */}
            <div className="essentials-alert__tags mb-3">
              {DEFAULT_ACADEMY_DATA.tags.map((tag, index) => (
                <span key={tag} className="essentials-alert__tag d-inline">
                  {tag}
                  {index < DEFAULT_ACADEMY_DATA.tags.length - 1 && ' • '}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="essentials-alert__description m-0 font-weight-normal">
              {DEFAULT_ACADEMY_DATA.description}
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Footer Upsell - Darker red section */}
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
                  href={SWITCH_TO_TEAMS_URL}
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
