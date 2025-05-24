import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram,FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col items-center gap-4">
          {/* Social Media */}
          <div className="flex flex-col items-center">
            <h3 className="text-base font-semibold mb-2 text-blue-200">Connect With Us</h3>
            <div className="flex items-center justify-center space-x-7">
              <a
                href="https://www.linkedin.com/in/ssmsipl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="mailto:hrd@ssmedworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaEnvelope size={24} />
              </a>
              <a
                href="https://www.facebook.com/ssmsipl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-blue-700 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/ssmedworld/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-pink-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="w-full flex justify-center border-t border-gray-700 pt-3">
            <p className="text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} SS Medical Systems (I) Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;