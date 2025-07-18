import { FormattedNumber } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

interface CurrencyProps {
  value: number;
  currency?: string;
}

const Currency: React.FC<CurrencyProps> = ({ value, currency = 'USD' }) => {
  const isInt = Number.isInteger(value);
  const formattingProps = {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: 2,
  };
  return (
    <FormattedNumber
      // eslint-disable-next-line react/style-prop-object
      style="currency"
      value={value}
      currency={currency}
      {...formattingProps}
    />
  );
};

Currency.propTypes = {
  value: PropTypes.number.isRequired,
  currency: PropTypes.string,
};

export default Currency;
