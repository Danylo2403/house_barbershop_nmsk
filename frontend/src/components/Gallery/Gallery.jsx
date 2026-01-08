import { useState, useEffect } from "react";
import "./Gallery.css";

// SVG иконки стрелок
const ChevronLeft = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export default function Gallery() {
  const galleryImages = [
    { id: 1, src: "/images/salon-1.jpg", alt: "" },
    { id: 2, src: "/images/salon-2.jpg", alt: "" },
    { id: 3, src: "/images/salon-3.jpg", alt: "" },
    { id: 4, src: "/images/salon-4.jpg", alt: "" },
    { id: 5, src: "/images/salon-5.jpg", alt: "" },
    { id: 6, src: "/images/salon-6.jpg", alt: "" },
    { id: 7, src: "/images/salon-7.jpg", alt: "" },
    { id: 8, src: "/images/salon-8.jpg", alt: "" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Показываем по 2 фотографии за раз
  const visibleImages = galleryImages.slice(currentIndex, currentIndex + 2);
  
  // Если осталось меньше 2 фотографий, добавляем из начала
  if (visibleImages.length < 2) {
    visibleImages.push(...galleryImages.slice(0, 2 - visibleImages.length));
  }

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex + 2 >= galleryImages.length ? 0 : prevIndex + 2
    );
    setTimeout(() => setIsAnimating(false), 400);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex - 2 < 0 ? galleryImages.length - (galleryImages.length % 2 || 2) : prevIndex - 2
    );
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Автоматическая смена слайдов каждые 5 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isAnimating]);

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">НАША ФІЛОСОФІЯ</h2>
          <p className="gallery-subtitle">Чекаємо саме вас!</p>
        </div>
        
        <div className="gallery-carousel">
          <button 
            className="carousel-btn prev-btn"
            onClick={prevSlide}
            aria-label="Попередні фото"
          >
            <ChevronLeft />
          </button>
          
          <div className={`carousel-images ${isAnimating ? 'fade' : ''}`}>
            {visibleImages.map((image, index) => (
              <div 
                key={image.id} 
                className="carousel-item"
                style={{ '--item-index': index }}
              >
                <div className="image-wrapper">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="gallery-image"
                    loading="lazy"
                    onError={(e) => {
                      console.error(`Failed to load image: ${image.src}`);
                      e.target.src = `https://via.placeholder.com/600x400/2d3748/ffffff?text=Gallery+${image.id}`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="carousel-btn next-btn"
            onClick={nextSlide}
            aria-label="Наступні фото"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="carousel-dots">
          {Array.from({ length: Math.ceil(galleryImages.length / 2) }).map((_, index) => (
            <button
              key={index}
              className={`dot ${currentIndex === index * 2 ? 'active' : ''}`}
              onClick={() => {
                setIsAnimating(true);
                setCurrentIndex(index * 2);
                setTimeout(() => setIsAnimating(false), 400);
              }}
              aria-label={`Перейти до фото ${index * 2 + 1}-${index * 2 + 2}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}