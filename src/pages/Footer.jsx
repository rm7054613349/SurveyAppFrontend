import { Link } from 'react-router-dom';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram,FaEnvelope } from 'react-icons/fa';
import logoImage from '../assets/Image.png'; 

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={logoImage}
                alt="SS Medical Systems Logo"
                className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] object-contain bg-white rounded-full p-1 shadow-md"
              />
              <span className="text-xl sm:text-2xl font-extrabold text-blue-300">
                SS Medical Systems
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed max-w-xs">
              Established in 1941, SS Medical Systems (I) Pvt. Ltd. is a leading MSME with 85 years of expertise in medical devices, recognized as the #1 rated start-up for healthcare excellence.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-200">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Services', 'R&D Papers', 'Careers'].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-200">Contact Us</h3>
            <p className="text-gray-200 text-sm font-medium">SS Medical Systems (I) Pvt. Ltd.</p>
            <p className="text-gray-200 text-sm mt-2">
              Email:{' '}
              <a href="mailto:hrd@ssmedworld.com" className="hover:text-blue-300 font-medium transition-colors duration-200">
                hrd@ssmedworld.com
              </a>
            </p>
            <p className="text-gray-200 text-sm mt-2">
              Phone:{' '}
              <a href="tel:+918177004474" className="hover:text-blue-300 font-medium transition-colors duration-200">
                8177004474
              </a>{' '}
              /{' '}
              <a href="tel:+918081588889" className="hover:text-blue-300 font-medium transition-colors duration-200">
                8081588889
              </a>
            </p>
            {/* <p className="text-gray-200 text-sm mt-2">Location: [Your Address]</p> */}
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-200">Connect With Us</h3>
            <div className="flex items-center space-x-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={30} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaEnvelope size={30} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-700 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={30} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-pink-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={30} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400 font-medium">
            © {new Date().getFullYear()} SS Medical Systems (I) Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;