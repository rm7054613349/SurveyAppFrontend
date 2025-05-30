import { motion } from 'framer-motion';
import { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Announcement from '../Intranet/Announcement';
import EventCalendar from '../Intranet/EventCalendar';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  pauseOnHover: true,
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

// Carousel images array with captions
const carouselImages = [
  { src: carouselImage1, alt: 'Team collaboration in workplace', caption: 'Teamwork in Action' },
  { src: carouselImage2, alt: 'Modern workplace environment', caption: 'Innovative Workspace' },
  { src: carouselImage3, alt: 'Corporate team meeting', caption: 'Strategic Discussions' },
  { src: carouselImage4, alt: 'Team collaboration in workplace', caption: 'Collaborative Success' },
  { src: carouselImage5, alt: 'Modern workplace environment', caption: 'Role-based UI' },
  { src: carouselImage6, alt: 'Corporate team meeting', caption: 'Team Synergy' },
  { src: carouselImage8, alt: 'Modern workplace environment', caption: 'Dynamic Office' },
  { src: carouselImage9, alt: 'Corporate team meeting', caption: 'Leadership Summit' },
];

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState(false);
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
                <button className="px-3 py-2 bg-[#00ced1] text-black text-sm font-medium rounded-full  transition-colors shadow-md hover:shadow-lg">
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
              {imagesLoaded ? (
                <div className="relative">
                  <Slider ref={sliderRef} className="relative" {...slickSettings}>
                    {carouselImages.map((image, index) => (
                      <div key={index} className="relative ">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full w-[600px] h-[270px] mx-auto rounded-xl shadow-lg transition-shadow duration-300 object-cover"
                          style={{ opacity: 1, filter: 'none' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x480/333333/FFFFFF?text=Image+Not+Found';
                          }}
                        />
                        <div className="text-center mt-2">
                          <span className="bg-[#00ced1] bg-opacity-60 text-black text-sm px-3 py-1 rounded-md">
                            {image.caption}
                          </span>
                        </div>
                      </div>
                    ))}
                  </Slider>
                  <div className="flex justify-center mt-4">
                    <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
                    <NextArrow onClick={() => sliderRef.current?.slickNext()} />
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                  <p className="text-gray-600">Loading carousel...</p>
                </div>
              )}
            </motion.div>

            {/* Subsection 3: Event Calendar */}
            {user?.role === 'employee' && (
             
                <EventCalendar />
            
            )}
          </div>
        ) : (
          /* Original Carousel Section for Admins */
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="mb-6 sm:mb-8 max-w-3xl mx-auto"
          >
            {imagesLoaded ? (
              <div className="relative">
                <Slider ref={sliderRef} className="relative" {...slickSettings}>
                  {carouselImages.map((image, index) => (
                    <div key={index} className="relative ">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full max-w-[600px] max-h-[480px] mx-auto rounded-xl shadow-lg transition-shadow duration-300 object-cover"
                        style={{ opacity: 1, filter: 'none' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/600x480/333333/FFFFFF?text=Image+Not+Found';
                        }}
                      />
                      <div className="text-center mt-2">
                        <span className="bg-[#00ced1] bg-opacity-60 text-black text-sm px-3 py-1 rounded-md">
                          {image.caption}
                        </span>
                      </div>
                    </div>
                  ))}
                </Slider>
                <div className="flex justify-center mt-4">
                  <PrevArrow onClick={() => sliderRef.current?.slickPrev()} />
                  <NextArrow onClick={() => sliderRef.current?.slickNext()} />
                </div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                <p className="text-gray-600">Loading carousel...</p>
              </div>
            )}
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