import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaFolder, FaArrowLeft } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Import images from src/assets/
import AwardAL2 from '../assets/award/AL3.jpg';
import AwardAL3 from '../assets/award/AL2.jpg';
import AwardAL4 from '../assets/award/AL3.jpg';
import AwardAL5 from '../assets/award/AL2.jpg';
import AwardAL6 from '../assets/award/AL3.jpg';
import AwardAL7 from '../assets/award/AL2.jpg';
// import FresherAA from '../assets/fresher_welcome/AA.jpg';
// import FresherAL9 from '../assets/fresher_welcome/AL9.jpg';
// import BirthdayAL7 from '../assets/birthday/AL7.jpg';
import BirthdayAL8 from '../assets/birthday/AL8.jpg';
import CulturalAL8 from '../assets/culture/AL8.jpg'; // Note: folder is 'culture', not 'cultural'

// Define folders with imported images
const folders = {
  award: [AwardAL2, AwardAL3,AwardAL4,AwardAL5,AwardAL6,AwardAL7],
  fresher_welcome: [AwardAL2, AwardAL3,AwardAL4,AwardAL5,AwardAL6,AwardAL7 ],
  birthday: [ BirthdayAL8,AwardAL2, AwardAL3,AwardAL4,AwardAL5,AwardAL6,AwardAL7],
  cultural: [CulturalAL8,AwardAL2, AwardAL3,AwardAL4,AwardAL5,AwardAL6,AwardAL7], 
};

const Gallery = () => {
  const [selectedFolder, setSelectedFolder] = useState(null); // Initialize as null to show folder grid

  useEffect(() => {
    // Reset selectedFolder to null on mount to show folder grid
    setSelectedFolder(null);
    localStorage.removeItem('selectedFolder');
  }, []); // Run only on mount

  useEffect(() => {
    if (selectedFolder) {
      localStorage.setItem('selectedFolder', selectedFolder);
    } else {
      localStorage.removeItem('selectedFolder');
    }
  }, [selectedFolder]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '80px',
    focusOnSelect: true,
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '40px',
        },
      },
    ],
  };

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
  };

  const handleBackClick = () => {
    setSelectedFolder(null);
  };

  // Function to capitalize the first letter of each word
  const capitalizeFirstLetter = (str) => {
    return str
      .replace('_', ' ') // Replace underscores with spaces
      .split(' ') // Split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(' '); // Join words back
  };

  return (
    <div className="p-5 bg-[#afeeee] py-9 min-h-screen font-['Playfair_Display']">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 navbar">
          {selectedFolder && (
            <button
              className="text-black text-3xl mr-4 transition-colors duration-300"
              onClick={handleBackClick}
            >
              <FaArrowLeft />
            </button>
          )}
          <h1 className="text-4xl font-bold text-black text-center flex-1 drop-shadow-lg">
            {selectedFolder ? capitalizeFirstLetter(selectedFolder) : 'Media Gallery'}
          </h1>
        </div>
        {!selectedFolder ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
            {Object.keys(folders).map((folder) => (
              <div
                key={folder}
                className="bg-white rounded-xl p-6 text-center cursor-pointer shadow-2xl hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center justify-center"
                onClick={() => handleFolderClick(folder)}
              >
                <FaFolder className="text-6xl text-yellow-500 mb-4" />
                <span className="text-xl text-gray-800 font-semibold">
                  {capitalizeFirstLetter(folder)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl">
            <Slider {...sliderSettings}>
              {folders[selectedFolder].map((image, index) => (
                <div key={index} className="px-3">
                  <img
                    src={image}
                    alt={`${selectedFolder}-${index}`}
                    className="w-full h-80 object-cover rounded-xl shadow-lg"
                    onError={(e) => console.error(`Failed to load image: ${image}`)}
                  />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;