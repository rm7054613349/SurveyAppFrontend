import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';

// Import images from assets folder
import image1 from '../assets/';
import image2 from '../assets/Image.png';
import image3 from '../assets/Image.png';
import image4 from '../assets/Image.png';

// Array of images for the carousel
const carouselImages = [image1, image2, image3, image4];

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  // Redirect logged-in users to Intranet Home
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

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    console.log('Home: Get Started clicked');
    navigate('/login');
  };

  // Handle image click to pause/resume carousel
  const handleImageClick = () => {
    setIsPaused(!isPaused);
  };

  // Handle mouse enter to pause carousel
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // Handle mouse leave to resume carousel
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Carousel options
  const owlOptions = {
    loop: true,
    margin: 10,
    nav: true,
    items: 1, // Show only one image at a time
    autoplay: !isPaused,
    autoplayTimeout: 3000,
    autoplayHoverPause: false, // Disable default hover pause to use custom handler
    smartSpeed: 800, // Smooth transition speed (in milliseconds)
    navText: [
      '<span class="owl-nav-prev">❮</span>',
      '<span class="owl-nav-next">❯</span>',
    ],
  };

  // Render carousel for non-logged-in users
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="full-width-content  dark:bg-[#1F2937] py-12"
    >
      {!user && (
        <>
          <motion.h1
            {...fadeIn}
            className="text-5xl font-bold mb-6 text-primary-blue text-center"
          >
            Welcome to Intranet World
          </motion.h1>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-700 dark:text-gray-300 mb-8 text-center"
          >
            Engage, Analyze, and Improve with our cutting-edge survey platform.
          </motion.p>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="w-full mb-8"
          >
            <OwlCarousel className="owl-theme" {...owlOptions}>
              {carouselImages.map((image, index) => (
                <div key={index} className="item">
                  <img
                    src={image}
                    alt={`Carousel Image ${index + 1}`}
                    className="w-full h-96 object-contain rounded-lg cursor-pointer"
                    onClick={handleImageClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  />
                </div>
              ))}
            </OwlCarousel>
          </motion.div>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-4"
          >
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default Home;