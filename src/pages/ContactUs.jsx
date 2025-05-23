import { motion } from 'framer-motion';

// Framer Motion animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function ContactUs() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen  dark:bg-[#1F2937] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] dark:text-[#D1D5DB] font-['Inter',sans-serif]">
            Contact Us
          </h1>
          <p className="mt-2 text-lg text-[#1F2937] dark:text-[#D1D5DB] font-['Inter',sans-serif]">
            Get in touch with SS Medical Systems (I) Pvt. Ltd.
          </p>
        </div>
        <div className="text-center text-[#1F2937] dark:text-[#D1D5DB] font-['Inter',sans-serif] space-y-4">
          <p className="text-lg font-medium">Reach us directly:</p>
          <p>Email: <a href="mailto:hrd@ssmedworld.com" className="text-[#1E3A8A] dark:text-[#60A5FA] hover:underline">hrd@ssmedworld.com</a></p>
          <p>Phone: <a href="tel:+918177004474" className="text-[#1E3A8A] dark:text-[#60A5FA] hover:underline">+91 8177004474</a> / <a href="tel:+918081588889" className="text-[#1E3A8A] dark:text-[#60A5FA] hover:underline">+91 8081588889</a></p>
        </div>
      </div>
    </motion.div>
  );
}

export default ContactUs;