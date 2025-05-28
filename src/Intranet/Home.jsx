import { motion } from 'framer-motion';
import { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import Announcement from '../Intranet/Announcement'; // Import Announcement component
import EventCalendar from '../Intranet/EventCalendar'; // Import EventCalendar component
import { FaFolder, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Import images
import carouselImage1 from '../assets/AL1.jpg';
import carouselImage2 from '../assets/AL2.jpg';
import carouselImage3 from '../assets/AL3.jpg';
import carouselImage4 from '../assets/AL4.jpg';
import carouselImage5 from '../assets/AL5.jpg';
import carouselImage6 from '../assets/AL6.jpg';
import carouselImage8 from '../assets/AL8.jpg';
import carouselImage9 from '../assets/AL9.jpg';
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

// Custom arrows
const PrevArrow = ({ onClick }) => (
  <button
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
    onClick={onClick}
  >
    <FaChevronLeft />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
    onClick={onClick}
  >
    <FaChevronRight />
  </button>
);

// Owl Carousel options
const carouselOptions = {
  loop: true,
  margin: 0,
  nav: true,
  items: 1,
  autoplay: true,
  autoplayTimeout: 4000,
  autoplayHoverPause: true,
  smartSpeed: 1800,
  prevArrow: <PrevArrow />,
  nextArrow: <NextArrow />,
  responsive: {
    0: { items: 1 },
    600: { items: 1 },
    1000: { items: 1 },
  },
};

// Carousel images array with captions
const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace', caption: 'Teamwork in Action' },
  { src: carouselImage2, alt: 'Modern office environment', caption: 'Innovative Workspace' },
  { src: carouselImage3, alt: 'Corporate team meeting', caption: 'Strategic Discussions' },
  { src: carouselImage4, alt: 'Team collaboration in workplace', caption: 'Collaborative Success' },
  { src: carouselImage5, alt: 'Modern office environment', caption: 'Modern Work Culture' },
  { src: carouselImage6, alt: 'Corporate team meeting', caption: 'Team Synergy' },
  { src: carouselImage8, alt: 'Modern office environment', caption: 'Dynamic Office' },
  { src: carouselImage9, alt: 'Corporate team meeting', caption: 'Leadership Summit' },
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
      <div className="p-4 sm:p-6 lg:p-8 bg-[#afeeee]">
        {/* Carousel Section (Conditional based on user role) */}
        {user?.role === 'employee' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 sm:mb-8 max-w-7xl mx-auto">
            {/* Subsection 1: Announcements */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="max-h-96 overflow-y-auto">
                <Announcement />
              </div>
              <Link to="/employee/all-announcements" className="mt-4 px-6 inline-block">
                <button className="px-3 py-2 bg-[#00ced1] text-black text-sm font-medium rounded-full hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg">
                  View All Announcements
                </button>
              </Link>
            </motion.div>

            {/* Subsection 2: Carousel */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <OwlCarousel className="owl-theme relative" {...carouselOptions}>
                {carouselImages.map((image, index) => (
                  <div key={index} className="item relative">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full max-w-[500px] max-h-[480px] mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 left-0 right-0 text-center">
                      <span className="bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-md">
                        {image.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </OwlCarousel>
            </motion.div>

            {/* Subsection 3: Event Calendar */}
            {user?.role === 'employee' && <EventCalendar />}
          </div>
        ) : (
          /* Original Carousel Section for Admins */
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="mb-6 sm:mb-8 max-w-3xl mx-auto"
          >
            <OwlCarousel className="owl-theme relative" {...carouselOptions}>
              {carouselImages.map((image, index) => (
                <div key={index} className="item relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full max-w-[600px] max-h-[480px] mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-md">
                      {image.caption}
                    </span>
                  </div>
                  {/* TODO: Add editing mechanism (e.g., input field or admin interface) to update image.caption dynamically */}
                </div>
              ))}
            </OwlCarousel>
          </motion.div>
        )}

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
              {user?.role === 'admin' ? 'Intranet Data Control' : 'Welcome to Document Center!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
              {user?.role === 'admin'
                ? 'Manage your team, monitor analytics, and access advanced tools to drive success.'
                : 'Access your personalized intranet tools, assessments, and media content to stay connected and productive.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(user?.role === 'admin' ? '/intranet-admin' : '/dashboard')}
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