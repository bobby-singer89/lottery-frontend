import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Scale } from 'lucide-react';

const advantages = [
  { icon: Shield, title: '100% on Blockchain', desc: 'TON transparency and security', color: 'purple' },
  { icon: Zap, title: 'Instant Payouts', desc: 'No delays or fees', color: 'yellow' },
  { icon: Lock, title: 'Fair Random', desc: 'VRF number generation', color: 'blue' },
  { icon: Scale, title: 'Low Price', desc: 'Ticket only 1 TON', color: 'green' },
];

const colorClasses = {
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
};

export default function Advantages() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
      }}
      className="py-16 px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {advantages.map((adv, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { y: 40, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
            className={`p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br border ${colorClasses[adv.color as keyof typeof colorClasses]}`}
          >
            <adv.icon size={40} className="mb-4" />
            <h3 className="text-lg font-bold mb-2 text-white">{adv.title}</h3>
            <p className="text-gray-300 text-sm">{adv.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
