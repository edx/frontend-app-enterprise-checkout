import { Card, CardCarousel as ParagonCardCarousel } from '@openedx/paragon';
import quotes from './quotes';

// CardCarousel component that displays all quotes in a carousel
const CardCarousel = () => {
  return (
    <ParagonCardCarousel
      ariaLabel="Inspirational quotes carousel"
      columnSizes={{
        xs: 12, sm: 12, md: 12, lg: 12, xl: 12,
      }}
    >
      {quotes.map((quoteItem, index) => (
        <Card key={index} className="p-6 text-center">
          <blockquote className="text-xl italic mb-2">"{quoteItem.quote}"</blockquote>
          <footer className="text-sm text-gray-500">— {quoteItem.author}</footer>
        </Card>
      ))}
    </ParagonCardCarousel>
  );
};

export default CardCarousel;
