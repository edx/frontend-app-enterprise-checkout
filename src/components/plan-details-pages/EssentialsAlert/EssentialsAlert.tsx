import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { AppContext, type AppContextValue } from '@edx/frontend-platform/react';
import {
  Alert, Button, Card,
} from '@openedx/paragon';
import { useContext } from 'react';

import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { DisplayPrice } from '@/components/DisplayPrice';
import { extractPriceObject } from '@/utils/checkout';

import './essentials-alert.scss';

// Constants for URLs and default values
const ESSENTIALS_PRICE_FALLBACK = 288; // Default price in dollars when API is unavailable
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

const EssentialsAlert = () => {
  const { authenticatedUser }: AppContextValue = useContext(AppContext);

  // Fetch pricing from BFF context
  // Price from BFF is in cents (e.g., 28800 for $288.00)
  // Select function converts cents to dollars
  const { data: pricePerYear } = useBFFContext(
    authenticatedUser?.userId ?? null,
    {
      select: (contextData): number => {
        const priceObject = extractPriceObject(contextData?.pricing);
        // Return price in dollars, or fallback if no price in BFF context
        return priceObject ? priceObject.unitAmount / 100 : ESSENTIALS_PRICE_FALLBACK;
      },
    },
  );

  // Ensure fallback price displays when API is unavailable (data is undefined during loading/error)
  const displayPrice = pricePerYear ?? ESSENTIALS_PRICE_FALLBACK;

  // TODO: Fetch academy data from API when endpoint is available
  // For now using default academy data
  const academyData: AcademyData = DEFAULT_ACADEMY_DATA;

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
              <span className="essentials-alert__course-badge">
                <FormattedMessage
                  id="checkout.essentialsAlert.courseCount"
                  defaultMessage="{count} courses"
                  description="Number of courses in academy"
                  values={{ count: academyData.courseCount }}
                />
              </span>
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
            </div>

            {/* Tags */}
            <div className="essentials-alert__tags">
              {academyData.tags.map((tag, index) => (
                <span key={tag} className="essentials-alert__tag">
                  {tag}
                  {index < academyData.tags.length - 1 && ' • '}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="essentials-alert__description">
              {academyData.description}
            </p>
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
