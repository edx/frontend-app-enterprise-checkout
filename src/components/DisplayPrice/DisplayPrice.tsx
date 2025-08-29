import { FormattedNumber } from '@edx/frontend-platform/i18n';

interface DisplayPriceProps {
  value: number;
  currency?: string;
}
const DisplayPrice = ({ value, currency = 'USD' }: DisplayPriceProps) => {
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

// @ts-ignore
export default DisplayPrice;
