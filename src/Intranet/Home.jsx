import { motion } from 'framer-motion';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

// Import images (using your provided image paths)
import carouselImage1 from '../assets/AL1.jpg';
import carouselImage2 from '../assets/AL2.jpg';
import carouselImage3 from '../assets/AL3.jpg';
import carouselImage4 from '../assets/AL4.jpg';
import carouselImage5 from '../assets/AL5.jpg';
import carouselImage6 from '../assets/AL6.jpg';
import carouselImage8 from '../assets/AL8.jpg';
import carouselImage9 from '../assets/AL9.jpg';

// Content Images
import intranetImage from '../assets/i1.jpg';
import assessmentImage from '../assets/Assesment.jpg';

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

// Owl Carousel options with enhanced sliding effect
const carouselOptions = {
  loop: true,
  margin: 0,
  nav: true,
  items: 1,
  autoplay: true,
  autoplayTimeout: 4000,
  autoplayHoverPause: true,
  smartSpeed: 1800,
  navText: [
    '<span class="owl-nav-prev text-white bg-teal-500 rounded-full p-3 text-lg">❮</span>',
    '<span class="owl-nav-next text-white bg-teal-500 rounded-full p-3 text-lg">❯</span>',
  ],
  animateOut: 'fadeOut',
  animateIn: 'fadeIn',
  responsive: {
    0: { items: 1 },
    600: { items: 1 },
    1000: { items: 1 },
  },
};

// Carousel images array
const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace' },
  { src: carouselImage2, alt: 'Modern office environment' },
  { src: carouselImage3, alt: 'Corporate team meeting' },
  { src: carouselImage4, alt: 'Team collaboration in workplace' },
  { src: carouselImage5, alt: 'Modern office environment' },
  { src: carouselImage6, alt: 'Corporate team meeting' },
  { src: carouselImage8, alt: 'Modern office environment' },
  { src: carouselImage9, alt: 'Corporate team meeting' },
];

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      console.log('Home: User not authenticated. Redirecting to /...');
      navigate('/');
    }
  }, [user, navigate]);

  // Log warning if role is undefined or unexpected
  useEffect(() => {
    if (user && !['admin', 'employee'].includes(user?.role)) {
      console.warn(`Home: Unexpected or undefined user role: ${user?.role}`);
    }
  }, [user]);

  return (
    <>
      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Carousel Section */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          animate="visible"
          className="mb-6 sm:mb-8 max-w-3xl mx-auto" // Added max-width and centered
        >
          <OwlCarousel className="owl-theme" {...carouselOptions}>
            {carouselImages.map((image, index) => (
              <div key={index} className="item relative">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full max-w-[600px] max-h-[480px] mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover" // Adjusted width
                  loading="lazy"
                />
              </div>
            ))}
          </OwlCarousel>
        </motion.div>

        {/* Intranet Section */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="sm:w-1/2 flex items-center">
            <img
              src={intranetImage}
              alt="Intranet logo"
              className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
              loading="lazy"
            />
          </div>
          <div className="sm:w-1/2 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              {user?.role === 'admin' ? 'Intranet Data Control' : 'Welcome to Intranet world!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              {user?.role === 'admin'
                ? 'Manage your team, monitor analytics, and access advanced tools to drive success.'
                : 'Access your personalized intranet tools, assessments, and media content to stay connected and productive.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit"
              aria-label="Navigate to dashboard"
            >
              Go To
            </motion.button>
          </div>
        </motion.div>

        {/* Assessment Section (Visible only for admin) */}
        {user?.role === 'admin' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6"
          >
            <div className="sm:w-1/2 flex flex-col justify-center order-1 sm:order-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                Assessment Data Control
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                Monitor key performance indicators, track progress, and gain insights with detailed reports and analytics.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg w-fit"
                aria-label="Navigate to performance dashboard"
              >
                Go To
              </motion.button>
            </div>
            <div className="sm:w-1/2 flex items-center order-0 sm:order-1">
              <img
                src={assessmentImage}
                alt="Assessment overview"
                className="w-full h-48 sm:h-64 md:h-80 object-cover rounded-lg shadow-md"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default Home;