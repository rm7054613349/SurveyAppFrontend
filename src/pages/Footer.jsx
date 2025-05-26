import { FaLinkedin, FaFacebook, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-[#00ced1]  text-black py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <h3 className="text-base font-semibold mb-2">Connect With Us</h3>
            <div className="flex items-center justify-center space-x-6">
              <a
                href="https://www.linkedin.com/in/ssmsipl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-200 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="mailto:hrd@ssmedworld.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-200 transition-colors duration-200"
                aria-label="Email"
              >
                <FaEnvelope size={20} />
              </a>
              <a
                href="https://www.facebook.com/ssmsipl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-200 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/ssmedworld/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-200 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>
          <div className="w-full flex justify-center border-t border-gray-300 dark:border-gray-600 pt-3">
            <p className="text-xs font-medium">
              © {new Date().getFullYear()} SS Medical Systems (I) Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;