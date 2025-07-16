import { Card, Carousel, CarouselItem } from '@openedx/paragon';
import quotes from './quotes';
import './CardCarousel.css';

// RegularCarousel component that uses the standard Carousel component
const RegularCarousel = () => {
  return (
    <div className="carousel-container">
      <Carousel
        controls
        indicators
        interval={5000}
        defaultActiveIndex={0}
        wrap
        slide
        touch
        fade
        className="mb-4 border rounded"
        nextLabel="Next Quote"
        prevLabel="Previous Quote"
      >
        {quotes.map((quoteItem, index) => (
          <CarouselItem key={index}>
            <div>
              <Card className="p-6 text-center border shadow">
                <blockquote className="text-xl italic mb-2">"{quoteItem.quote}"</blockquote>
                <footer className="text-sm text-gray-500">— {quoteItem.author}</footer>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
};

export default RegularCarousel;
