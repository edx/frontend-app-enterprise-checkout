import { useState, useEffect } from 'react';
import { Card } from '@openedx/paragon';
import quotes from './quotes';
import './CardCarousel.css';

// CardInterval component that updates to a random quote every 2.5 seconds
const CardInterval = () => {
  const [randomQuote, setRandomQuote] = useState(() =>
    quotes[Math.floor(Math.random() * quotes.length)]
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start transition effect
      setIsTransitioning(true);

      // Wait for fade-out to complete before changing quote
      setTimeout(() => {
        // Get a new random quote
        const newRandomIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[newRandomIndex]);

        // End transition effect
        setIsTransitioning(false);
      }, 500); // Half of the transition time

    }, 5000); // 2.5 seconds interval

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="card-interval p-6 text-center">
      <div className="card-interval-content">
        <blockquote className={`text-xl italic mb-2 quote-text ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          &quot;{randomQuote.quote}&quot;
        </blockquote>
        <footer className={`text-sm text-gray-500 author-text ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          — {randomQuote.author}
        </footer>
      </div>
    </Card>
  );
};

export default CardInterval;
