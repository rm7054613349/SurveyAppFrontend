import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { pageTransition, fadeIn, buttonHover } from '../animations/framerAnimations';

// Import images from assets folder
import carouselImage1 from '../assets/BL1.png';
import carouselImage2 from '../assets/BL2.png';
import carouselImage3 from '../assets/BL3.png';

// Array of images for the carousel
const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace' },
  { src: carouselImage2, alt: 'Modern office environment' },
  { src: carouselImage3, alt: 'Corporate team meeting' },
];

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
    autoplayTimeout: 4000, // Slightly longer for better UX
    autoplayHoverPause: false, // Disable default hover pause to use custom handler
    smartSpeed: 1800, // Smoother transition speed
    navText: [
      '<span class="owl-nav-prev text-3xl text-white bg-primary-blue rounded-full px-4 py-2">❮</span>',
      '<span class="owl-nav-next text-3xl text-white bg-primary-blue rounded-full px-4 py-2">❯</span>',
    ],
    responsive: {
      0: { items: 1 },
      600: { items: 1 },
      1000: { items: 1 },
    },
  };

  // Render carousel for non-logged-in users
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="dark:bg-[#1F2937] py-12"
    >
      {!user && (
        <>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.4 }}
            className="mb-8 max-w-4xl mx-auto" // Added max-width and centered the carousel
          >
            <OwlCarousel className="owl-theme" {...owlOptions}>
              {carouselImages.map((image, index) => (
                <div key={index} className="item relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full max-w-[600px] max-h-[400px] mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover" // Adjusted width and maintained aspect ratio
                    loading="lazy"
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
            {/* Add your "Get Started" button here if needed */}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default Home;