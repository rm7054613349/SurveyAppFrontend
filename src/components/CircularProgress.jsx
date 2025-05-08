import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function CircularProgress({ score, total, title }) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: total - score },
  ];
  const COLORS = ['#16a34a', '#e5e7eb'];

  return (
    <motion.div
      className="flex flex-col items-center content-box"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-primary-blue mb-2">{title}</h3>
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-gray-700 dark:text-gray-300 mt-2">
        {score} / {total}
      </p>
    </motion.div>
  );
}

export default CircularProgress;