import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaFolder, FaArrowLeft } from 'react-icons/fa';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Sample image imports (replace with actual paths or dynamic imports)
const folders = {
  award: [
    '../assets/award/AL2.jpg',
    '../assets/award/award2.jpg',
  ],
  fresher_welcome: [
    '../assets/fresher_welcome/fresher1.jpg',
    '../assets/fresher_welcome/fresher2.jpg',
  ],
  birthday: [
    '../assets/birthday/birthday1.jpg',
    '../assets/birthday/birthday2.jpg',
  ],
  cultural: [
    '../assets/cultural/cultural1.jpg',
    '../assets/cultural/cultural2.jpg',
  ],
};

const Gallery = () => {
  const [selectedFolder, setSelectedFolder] = useState(() => {
    return localStorage.getItem('selectedFolder') || null;
  });

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

  return (
    <div className="p-5 bg-[#afeeee] py-10 min-h-screen font-['Playfair_Display']">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 navbar">
          {selectedFolder && (
            <button
              className="text-black text-3xl mr-4  transition-colors duration-300"
              onClick={handleBackClick}
            >
              <FaArrowLeft />
            </button>
          )}
          <h1 className="text-4xl font-bold text-black text-center flex-1 drop-shadow-lg">
            {selectedFolder ? selectedFolder.replace('_', ' ') : 'Media Gallery'}
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
                <span className="text-xl text-gray-800 capitalize font-semibold">
                  {folder.replace('_', ' ')}
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