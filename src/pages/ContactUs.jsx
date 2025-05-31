// src/pages/ContactUs.js
import React from 'react';
import { motion } from 'framer-motion';

const ContactUs = () => {
  // Animation variants for main branch cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  // Animation variants for other branch cards (staggered)
  const otherBranchVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  };

  // Animation for query section
  const querySectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5 } },
  };

  // Sample data for branches
  const mainBranches = [
    {
      name: 'Lucknow (Head Office)',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3124.181079221699!2d80.947339!3d26.843205!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfda7c6930cb3%3A0x99173fda043268d7!2sS.S.%20Medical%20System%20(I)%20Pvt.%20Ltd.!5e1!3m2!1sen!2sin!4v1748244416974!5m2!1sen!2sin',
      address: '5 Park Road Thapar House, opposite Civil Hospital, Hazratganj, Lucknow, Uttar Pradesh 226001',
      phone: '8874303188',
      email: 'admin.mgr@ssmedworld.com'
    },
    {
      name: 'Delhi',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.2396718748546!2d77.2038231!3d28.565838799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3e4d6d9b7f3%3A0xdafba90764fca303!2sSS%20Medical%20Systems%20India%20Pvt.%20Ltd.!5e1!3m2!1sen!2sin!4v1748245162688!5m2!1sen!2sin',
      address: 'Flat No. G-3 Ground Floor, Delhi Blue Apartments, Factory Road -2, Ring Rd, near Safdarjung Hospital, New Delhi, Delhi 110029',
      phone: '7318094342',
      email: 'admin.delhi@ssmedworld.com',
    },
  ];

  const otherBranches = [
    { name: 'BHIMTAL', address: 'S S Medical Systems (I) Pvt. Ltd.F2, Bhimtal Industrial Estate, BhimtalDistrict Nainital, Uttarakhand-263136  , Phone: 05942-248138   Mob: 7534812029' },
    { name: 'MUMBAI', address: 'Branch Office' },
    { name: 'AHMEDABAD', address: 'Branch Office' },
    { name: 'VIZAG', address: 'Branch Office' },
    { name: 'GUWAHATI', address: 'Branch Office' },
    { name: 'BENGALURU', address: 'Branch Office' },
    { name: 'KERALA', address: '' },
    { name: 'UNITED KINGDOM', address: '' },
  ];

  return (
    <div className="min-h-screen bg-[#afeeee] py-12 px-4 sm:px-6 lg:px-8">
      {/* First Section: Branches */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="max-w-7xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-roboto text-center text-gray-800 mb-10">
          Our Locations
        </h2>

        {/* Main Branches (2 in a Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {mainBranches.map((branch, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <iframe
                src={branch.mapUrl}
                width="100%"
                height="300"
                className="block w-full border-0"
                allowFullScreen=""
                loading="lazy"
                title={`${branch.name} Map`}
              ></iframe>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">{branch.name}</h3>
                <p className="text-gray-600 mb-2"><strong>Address:</strong> {branch.address}</p>
                <p className="text-gray-600 mb-2"><strong>Phone:</strong> {branch.phone}</p>
                <p className="text-gray-600">
                  <strong>Email:</strong>{' '}
                  <a href={`mailto:${branch.email}`} className="text-blue-600 hover:underline">
                    {branch.email}
                  </a>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Other Branches (3x3 Grid) */}
        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">Other Branches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherBranches.map((branch, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={otherBranchVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{branch.name}</h4>
              <p className="text-gray-600">{branch.address}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Second Section: Query */}
      <motion.section
        variants={querySectionVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto bg-[#00ced1] text-white py-12 px-8 rounded-lg shadow-lg text-center"
      >
        <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
        <p className="text-lg mb-8">
          Have a question or need assistance? Reach out to us via the form or email below.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <motion.a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfUaJ3ROo0SFBcj5EDPT-3j9a5dXS976ZiFvLoIaWuyMjAdlg/viewform?usp=header" // Replace with actual Google Form link
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open query form"
          >
             Query
          </motion.a>
          {/* <motion.a
            href="mailto:it.desk@ssmedworld.com"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-100 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Email us"
          >
            Email Us
          </motion.a> */}
        </div>
      </motion.section>
    </div>
  );
};

export default ContactUs;