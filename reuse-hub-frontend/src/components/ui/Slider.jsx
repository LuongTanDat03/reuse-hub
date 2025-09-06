import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Slider = ({ 
  children, 
  autoPlay = false, 
  autoPlayInterval = 3000,
  showDots = true,
  className = '',
  ...props 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = React.Children.toArray(children);

  React.useEffect(() => {
    if (autoPlay && slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`} {...props}>
      {/* Slider Container */}
      <div 
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-global-7 bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 transition-all duration-200 shadow-lg"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-global-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-global-7 bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 transition-all duration-200 shadow-lg"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-global-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                currentSlide === index 
                  ? 'bg-global-4 scale-125' :'bg-global-7 bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Slider.propTypes = {
  children: PropTypes.node,
  autoPlay: PropTypes.bool,
  autoPlayInterval: PropTypes.number,
  showDots: PropTypes.bool,
  className: PropTypes.string,
};

export default Slider;