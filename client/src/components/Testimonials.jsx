import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaClipboardCheck, FaStar } from 'react-icons/fa';
import "../styles/testimonials.scss";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Retail Store Manager",
      company: "Urban Outfitters",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content: "This inventory system has transformed how we manage our stock. We've reduced overstock issues by 35% and never run out of bestsellers anymore. The real-time tracking is a game-changer for our busy store.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Operations Director",
      company: "Tech Solutions Inc.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content: "After trying several inventory solutions, this platform stands out for its ease of use and powerful analytics. Our warehouse efficiency has improved dramatically, and the vendor management tools are excellent.",
      rating: 5
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      position: "Supply Chain Manager",
      company: "Global Distributors",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      content: "The integration capabilities with our existing systems made implementation a breeze. Now our entire supply chain is synchronized, and we've cut order processing time in half. Outstanding support team too!",
      rating: 4
    },
    {
      id: 4,
      name: "James Wilson",
      position: "E-commerce Owner",
      company: "Outdoor Adventures",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
      content: "For a small business like ours, this inventory system is perfect. It's affordable yet powerful enough to handle our seasonal fluctuations. The mobile app lets me check stock levels even when I'm sourcing products on the road.",
      rating: 5
    }
  ];

  // Function to go to next slide
  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match this to your CSS transition time
    }
  };

  // Function to go to previous slide
  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match this to your CSS transition time
    }
  };

  // Function to go to a specific slide
  const goToSlide = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      
      // Reset animation flag after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Match this to your CSS transition time
    }
  };

  // Auto-advance the carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentSlide]);

  // Render star ratings
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <FaStar 
        key={index} 
        className={`star ${index < rating ? 'filled' : 'empty'}`} 
      />
    ));
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="section-heading">
          <h2>What Our Customers Say</h2>
          <div className="clipboard-icon">
            <FaClipboardCheck />
          </div>
        </div>
        
        <div className="testimonials-carousel">
          <div className="carousel-container">
            <button 
              className="carousel-control prev" 
              onClick={prevSlide}
              aria-label="Previous testimonial"
            >
              <FaChevronLeft />
            </button>
            
            <div className="carousel-track-container">
              <div 
                className="carousel-track" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.id} 
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    <div className="testimonial-card">
                      <div className="quote-icon">
                        <FaQuoteLeft />
                      </div>
                      
                      <div className="testimonial-content">
                        <p>{testimonial.content}</p>
                      </div>
                      
                      <div className="testimonial-rating">
                        {renderStars(testimonial.rating)}
                      </div>
                      
                      <div className="testimonial-author">
                        <div className="author-avatar">
                          <img src={testimonial.avatar} alt={testimonial.name} />
                        </div>
                        <div className="author-info">
                          <h4>{testimonial.name}</h4>
                          <p>{testimonial.position}</p>
                          <p className="company">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="carousel-control next" 
              onClick={nextSlide}
              aria-label="Next testimonial"
            >
              <FaChevronRight />
            </button>
          </div>
          
          <div className="carousel-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;