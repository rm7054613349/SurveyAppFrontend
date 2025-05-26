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
      className="min-h-screen  bg-[#afeeee] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] font-['Inter',sans-serif]">
           Media Gallary
          </h1>
          <p className="mt-2 text-lg text-[#1F2937] font-['Inter',sans-serif]">
            Show all Media
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default ContactUs;