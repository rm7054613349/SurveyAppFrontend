import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaFolder, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Import images from src/assets/
import AwardAL2 from '../assets/award/AL3.jpg';
import AwardAL3 from '../assets/award/AL2.jpg';
import AwardAL4 from '../assets/award/AL3.jpg';
import AwardAL5 from '../assets/award/AL2.jpg';
import AwardAL6 from '../assets/award/AL3.jpg';
import AwardAL7 from '../assets/award/AL2.jpg';
import BirthdayAL8 from '../assets/birthday/AL8.jpg';
import CulturalAL8 from '../assets/culture/AL8.jpg';

// Folder data with captions
const folders = {
  ExternalAwards: [
    { image: AwardAL2, caption: 'Award Ceremony' },
    { image: AwardAL3, caption: 'Certificate Distribution' },
    { image: AwardAL4, caption: 'Team Recognition' },
    { image: AwardAL5, caption: 'Outstanding Performer' },
    { image: AwardAL6, caption: 'Annual Meet' },
    { image: AwardAL7, caption: 'Guest Lecture' }
  ],
  NewHire: [
    { image: AwardAL2, caption: 'Welcome Session' },
    { image: AwardAL3, caption: 'Meet & Greet' },
    { image: AwardAL4, caption: 'Intro Round' },
    { image: AwardAL5, caption: 'Office Tour' },
    { image: AwardAL6, caption: 'First Day Click' },
    { image: AwardAL7, caption: 'New Buddy Assigned' }
  ],
  InhouseFestivals: [
    { image: BirthdayAL8, caption: 'Birthday Bash' },
    { image: AwardAL2, caption: 'Office Decoration' },
    { image: AwardAL3, caption: 'Food Festival' },
    { image: AwardAL4, caption: 'Holi Celebration' },
    { image: AwardAL5, caption: 'Lighting Ceremony' },
    { image: AwardAL6, caption: 'Traditional Day' },
    { image: AwardAL7, caption: 'Diwali Moments' }
  ],
  TownHall: [
    { image: CulturalAL8, caption: 'Annual Townhall' },
    { image: AwardAL2, caption: 'Presentation Highlights' },
    { image: AwardAL3, caption: 'Leadership Q&A' },
    { image: AwardAL4, caption: 'Team Announcements' },
    { image: AwardAL5, caption:'Appreciation Speech' },
    { image: AwardAL6, caption: 'Achievements Recap' },
    { image: AwardAL7, caption: 'Group Photo' }
  ],
  RewardsAndRecognition: [
    { image: CulturalAL8, caption: 'Reward Day' },
    { image: AwardAL2, caption: 'Star Performer' },
    { image: AwardAL3, caption: 'Quarterly Award' },
    { image: AwardAL4, caption: 'Leadership Token' },
    { image: AwardAL5, caption: 'Best Innovator' },
    { image: AwardAL6, caption: 'Top Collaborator' },
    { image: AwardAL7, caption: 'Milestone Award' }
  ]
};

// Custom arrows
const PrevArrow = ({ onClick }) => (
  <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75" onClick={onClick}>
    <FaChevronLeft />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75" onClick={onClick}>
    <FaChevronRight />
  </button>
);

const Gallery = () => {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCaption, setSelectedCaption] = useState(null);

  // Load saved folder from localStorage on mount
  useEffect(() => {
    const savedFolder = localStorage.getItem('selectedFolder');
    if (savedFolder && folders[savedFolder]) {
      setSelectedFolder(savedFolder);
    } else {
      setSelectedFolder(null);
      localStorage.removeItem('selectedFolder');
    }
  }, []);

  // Save selected folder to localStorage when it changes
  useEffect(() => {
    if (selectedFolder) {
      localStorage.setItem('selectedFolder', selectedFolder);
    } else {
      localStorage.removeItem('selectedFolder');
    }
  }, [selectedFolder]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup on component unmount or modal close
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedImage]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '100px',
    focusOnSelect: true,
    lazyLoad: 'ondemand',
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '50px',
        },
      },
    ],
  };

  const capitalizeFirstLetter = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace('_', ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  return (
    <div className="p-5 bg-[#afeeee] py-9 min-h-screen font-['Playfair_Display']">
      <style>
        {`
          .slick-slide {
            transition: transform 0.8s ease, opacity 0.8s ease;
            opacity: 0.6;
            transform: scale(0.8);
          }
          .slick-slide.slick-active {
            opacity: 0.8;
            transform: scale(0.9);
          }
          .slick-slide.slick-center {
            opacity: 1;
            transform: scale(1);
          }
          .slick-prev, .slick-next {
            display: none !important;
          }
          .slick-dots li button:before {
            font-size: 12px;
            color: #ffffff;
            opacity: 0.5;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1;
            color: #000000;
          }
          .image-container {
            position: relative;
            display: inline-block;
            width: 100%;
            height: 100%;
          }
          .slider-image {
            width: 100%;
            max-height: 20rem; /* h-80 equivalent */
            object-fit: contain;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            cursor: pointer;
          }
          .image-caption {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 0.875rem;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem 0.25rem 0 0;
            z-index: 10;
            display: none;
            white-space: nowrap;
          }
          .slick-center .image-caption {
            display: block;
          }
          .modal-image {
            width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 0.75rem;
          }
          .modal-caption {
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 1rem;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem 0.25rem 0 0;
            z-index: 10;
            white-space: nowrap;
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 navbar">
          {selectedFolder && (
            <button
              className="text-black text-2xl mr-4 transition-colors duration-300 hover:text-gray-600"
              onClick={() => {
                setSelectedFolder(null);
                setSelectedImage(null);
                setSelectedCaption(null);
              }}
            >
              <FaArrowLeft />
            </button>
          )}
          <h1 className="text-4xl font-bold text-black text-center flex-1 drop-shadow-lg">
            {selectedFolder ? capitalizeFirstLetter(selectedFolder) : 'Media Gallery'}
          </h1>
        </div>
        {!selectedFolder ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 p-6">
            {Object.keys(folders).map((folder) => (
              <div
                key={folder}
                className="p-6 text-center cursor-pointer duration-300 flex flex-col items-center justify-center"
                onClick={() => setSelectedFolder(folder)}
              >
                <FaFolder className="text-6xl text-[#014D4E] mb-4" />
                <span className="text-xl text-gray-800 font-semibold">
                  {capitalizeFirstLetter(folder)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl">
            <Slider {...sliderSettings}>
              {folders[selectedFolder].map((item, index) => (
                <div key={index} className="px-3">
                  <div className="image-container">
                    <img
                      src={item.image}
                      alt={`${selectedFolder}-${index}`}
                      className="slider-image"
                      onClick={() => {
                        setSelectedImage(item.image);
                        setSelectedCaption(item.caption);
                      }}
                      onError={(e) => console.error(`Failed to load image: ${item.image}`)}
                    />
                    <div className="image-caption">
                      {item.caption}
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-md"
            onClick={() => {
              setSelectedImage(null);
              setSelectedCaption(null);
            }}
          >
            <div className="relative max-w-4xl w-full mx-4 my-8">
              <img
                src={selectedImage}
                alt="Enlarged"
                className="modal-image"
                onClick={(e) => e.stopPropagation()}
              />
              {selectedCaption && (
                <div className="modal-caption">
                  {selectedCaption}
                </div>
              )}
              <button
                className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedCaption(null);
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;