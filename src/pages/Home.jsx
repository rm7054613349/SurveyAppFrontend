import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';

import carouselImage1 from '../assets/BL1.png';
import carouselImage2 from '../assets/BL2.png';
import carouselImage3 from '../assets/BL3.png';

const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace' },
  { src: carouselImage2, alt: 'Modern office environment' },
  { src: carouselImage3, alt: 'Corporate team meeting' },
];

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

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
    setIsPaused((prev) => !prev);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const owlOptions = {
    loop: true,
    margin: 0,
    nav: true,
    items: 1,
    autoplay: !isPaused,
    autoplayTimeout: 4000,
    autoplayHoverPause: false,
    smartSpeed: 1800,
    navText: [
      '<span class="owl-nav-prev text-xl sm:text-2xl text-white bg-teal-500 rounded-full px-2 sm:px-3 py-1 sm:py-2">❮</span>',
      '<span class="owl-nav-next text-xl sm:text-2xl text-white bg-teal-500 rounded-full px-2 sm:px-3 py-1 sm:py-2">❯</span>',
    ],
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 },
    },
  };

  return (
    <motion.div
      className="w-full flex-1 flex flex-col items-center justify-start min-h-screen bg-[#afeeee] dark:bg-gray-900 px-4 sm:px-6 md:px-8"
      {...pageTransition}
    >
      {!user && (
        <>
          <motion.h1
            {...fadeIn}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mt-8 sm:mt-10 md:mt-12 mb-6 sm:mb-8 md:mb-10 text-gray-900 dark:text-white text-center"
          >
            SSMED Central – Your Workplace Dashboard
          </motion.h1>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="w-full max-w-[90%] sm:max-w-3xl md:max-w-5xl mx-auto mb-6 sm:mb-8 md:mb-10"
          >
            <OwlCarousel className="owl-theme" {...owlOptions}>
              {carouselImages.map((image, index) => (
                <div key={index} className="item relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full max-h-[200px] sm:max-h-[300px] md:max-h-[400px] h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-contain"
                    loading="lazy"
                    onClick={handleImageClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              ))}
            </OwlCarousel>
          </motion.div>
          
        </>
      )}
    </motion.div>
  );
}

export default Home;