import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from './icons';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  image?: string;
  bgColor?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Advanced Industrial Automation',
    subtitle: 'Smart Robotics • Precision Pneumatics • Connected Sensors for the Smart Factory.',
    tag: 'MINAMI AUTOTECH',
    image: '/images/banner1.png',
  },
  {
    id: 2,
    title: 'SMC Pneumatic Solutions',
    subtitle: 'Authorized distributor of SMC Japan in Vietnam. Premium valves, actuators, and air preparation.',
    tag: 'SMC VIETNAM PARTNER',
    image: '/images/banner3.png',
  },
  {
    id: 3,
    title: 'Precision Temperature Control',
    subtitle: 'Omron Temperature Controllers and PLC Systems. Maximize efficiency, minimize down-time.',
    tag: 'OMRON GOLD DISTRIBUTOR',
    image: '/images/banner4.png',
  }
];

interface SliderProps {
  onContactClick?: () => void;
  onProductsClick?: () => void;
}

export const Slider: React.FC<SliderProps> = ({ onContactClick, onProductsClick }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any | null>(null);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="slides-wrapper"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {SLIDES.map(slide => (
          <div
            key={slide.id}
            className="slide-item"
            style={{
              background: slide.image ? `url(${slide.image}) center/cover no-repeat` : slide.bgColor
            }}
          >
            {/* Dark tint overlay for better text contrast */}
            <div className="slide-overlay" />

            <div className="slide-content">
              <span className="slide-tag">{slide.tag}</span>
              <h1 className="slide-title">{slide.title}</h1>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <div className="slide-actions">
                <button
                  onClick={onProductsClick}
                  className="btn btn-secondary"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  Xem Sản Phẩm
                </button>
                <button
                  onClick={onContactClick}
                  className="btn btn-outline slide-btn-outline"
                  style={{ cursor: 'pointer' }}
                >
                  Liên Hệ Tư Vấn
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control arrows */}
      <button className="slider-arrow arrow-left" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button className="slider-arrow arrow-right" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      {/* Slide indicators (dots) */}
      <div className="slider-indicators">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${index === activeSlide ? 'active' : ''}`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        .hero-slider {
          position: relative;
          width: 100%;
          height: 350px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          background-color: var(--primary-color);
        }

        @media (min-width: 768px) {
          .hero-slider {
            height: 400px;
          }
        }

        .slides-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slide-item {
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          padding: var(--space-4);
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .slide-item {
            padding: var(--space-8);
          }
        }

        .slide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(6, 35, 77, 0.85) 0%, rgba(6, 35, 77, 0.4) 100%);
          z-index: 1;
        }

        .slide-content {
          position: relative;
          z-index: 2;
          max-width: 600px;
          color: var(--text-white);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-3);
          animation: slideUpContent 500ms ease-out forwards;
          margin-left: 10px;
        }

        @media (min-width: 768px) {
          .slide-content {
            margin-left: 60px;
          }
        }

        .slide-tag {
          background-color: var(--accent-color);
          color: var(--text-white);
          font-size: var(--font-size-xs);
          font-weight: 700;
          padding: 4px var(--space-3);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .slide-title {
          font-size: var(--font-size-xl);
          font-weight: 800;
          color: var(--text-white);
          line-height: var(--line-height-tight);
        }

        @media (min-width: 768px) {
          .slide-title {
            font-size: var(--font-size-2xl);
          }
        }

        .slide-subtitle {
          font-size: var(--font-size-sm);
          line-height: var(--line-height-normal);
          color: rgba(255, 255, 255, 0.9);
        }

        @media (min-width: 768px) {
          .slide-subtitle {
            font-size: var(--font-size-base);
          }
        }

        .slide-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-2);
          width: 100%;
        }

        @media (min-width: 480px) {
          .slide-actions {
            flex-direction: row;
            gap: var(--space-3);
          }
        }

        .slide-btn-outline {
          border-color: var(--text-white);
          color: var(--text-white);
        }

        .slide-btn-outline:hover {
          background-color: rgba(255, 255, 255, 0.15);
          color: var(--text-white);
        }

        /* Arrows */
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-round);
          background-color: rgba(255, 255, 255, 0.15);
          color: var(--text-white);
          display: none;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          transition: all var(--transition-fast);
        }

        @media (min-width: 576px) {
          .slider-arrow {
            display: flex;
          }
        }

        .slider-arrow:hover {
          background-color: var(--accent-color);
        }

        .slider-arrow:active {
          transform: translateY(-50%) scale(0.95);
        }

        .arrow-left {
          left: var(--space-4);
        }

        .arrow-right {
          right: var(--space-4);
        }

        /* Indicators */
        .slider-indicators {
          position: absolute;
          bottom: var(--space-4);
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: var(--space-2);
        }

        .indicator-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-round);
          background-color: rgba(255, 255, 255, 0.4);
          transition: all var(--transition-fast);
        }

        .indicator-dot.active {
          background-color: var(--accent-color);
          width: 24px;
        }

        @keyframes slideUpContent {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
