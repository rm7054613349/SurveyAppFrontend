import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { pageTransition, fadeIn } from '../animations/framerAnimations';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import carouselImage1 from '../assets/BL1.png';
import carouselImage2 from '../assets/BL2.png';
import carouselImage3 from '../assets/BL3.png';

const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace', caption: 'Teamwork in Action' },
  { src: carouselImage2, alt: 'Modern office environment', caption: 'Innovative Workspace' },
  { src: carouselImage3, alt: 'Corporate team meeting', caption: 'Strategic Discussions' },
];

// Custom arrows
const PrevArrow = ({ onClick }) => (
  <button
    className="inline-block mx-2 text-gray-500 text-lg rounded-full p-2 cursor-pointer"
    onClick={onClick}
    aria-label="Previous slide"
  >
    <FaChevronLeft />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    className="inline-block mx-2 text-gray-500 text-lg rounded-full p-2 cursor-pointer"
    onClick={onClick}
    aria-label="Next slide"
  >
    <FaChevronRight />
  </button>
);

// React Slick settings
const slickSettings = {
  dots: false,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  pauseOnHover: false, // Disable default hover pause
  arrows: false,
  initialSlide: 0,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
};

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef(null);

  // Preload images with timeout fallback
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = carouselImages.length;
    const timeout = setTimeout(() => {
      if (!imagesLoaded) {
        console.warn('Image preloading timed out after 5s');
        setImagesLoaded(true);
      }
    }, 5000);

    const handleImageLoad = () => {
      loadedCount += 1;
      if (loadedCount === totalImages) {
        console.log('All images preloaded successfully');
        setImagesLoaded(true);
        clearTimeout(timeout);
      }
    };

    carouselImages.forEach((image) => {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        console.log(`Loaded image: ${image.src}`);
        handleImageLoad();
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${image.src}`);
        handleImageLoad();
      };
    });

    return () => clearTimeout(timeout);
  }, [imagesLoaded]);

  // Redirect to Intranet/Home if authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Home: Checking login status on mount - Token:', token, 'Role:', role);

    if (token && user) {
      console.log('Home: User is logged in. Redirecting to /Intranet/Home...');
      navigate('/Intranet/Home');
    } else {
      console.log('Home: User is not logged in. Rendering public home page with carousel.');
    }
  }, [navigate, user]);

  const handleGetStarted = () => {
    console.log('Home: Get Started clicked');
    navigate('/login');
  };

  const handleImageClick = () => {
    setIsPaused((prev) => {
      if (!prev) {
        sliderRef.current?.slickPause();
      } else {
        sliderRef.current?.slickPlay();
      }
      return !prev;
    });
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
    sliderRef.current?.slickPause();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    sliderRef.current?.slickPlay();
  };

  return (
    <motion.div
      className="w-full flex-1 flex flex-col items-center justify-start min-h-screen bg-[#afeeee]  px-4 sm:px-6 md:px-8"
      {...pageTransition}
    >
      {!user && (
        <>
          <h2
            className="text-3xl font-roboto mt-8 sm:mt-10 md:mt-12 mb-6 sm:mb-8 md:mb-10 text-gray-900 dark:text-white text-center"
          >
            SSMED Central – Your Workplace Dashboard
          </h2>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="w-full max-w-[90%] sm:max-w-3xl md:max-w-5xl mx-auto mb-6 sm:mb-8 md:mb-10"
          >
            {imagesLoaded ? (
              <div className="relative">
                <Slider ref={sliderRef} className="relative" {...slickSettings}>
                  {carouselImages.map((image, index) => (
                    <div key={index} className="">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="max-h-[200px] sm:max-h-[300px] md:max-h-[400px] h-auto mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-contain cursor-pointer"
                        style={{ opacity: 1, filter: 'none' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/500x400/1a1a1a/FFFFFF?text=Image+Failed';
                        }}
                        onClick={handleImageClick}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      />
                      <div className="text-center mt-2">
                        <span className="bg-[#00ced1] text-black text-sm px-3 py-1 rounded-md">
                          {image.caption}
                        </span>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="flex justify-center mt-2">
                  <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
                  <NextArrow onClick={() => sliderRef.current?.slickNext()} />
                </div>
              </div>
            ) : (
              <div className="w-full max-h-[200px] sm:max-h-[300px] md:max-h-[400px] h-auto flex items-center justify-center bg-gray-200">
                <p className="text-gray-600">Loading carousel...</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default Home;