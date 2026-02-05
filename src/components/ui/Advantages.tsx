import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, Zap, Lock, Scale } from 'lucide-react';

const advantages = [
  {
    icon: Shield,
    title: 'Provably Fair',
    description: 'Blockchain-verified draws ensure complete transparency and fairness',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    description: 'Win big and get paid instantly to your wallet, no waiting',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  {
    icon: Lock,
    title: 'Secure & Anonymous',
    description: 'Your privacy is protected with decentralized blockchain technology',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    icon: Scale,
    title: 'Low Fees',
    description: 'Minimal transaction costs mean more winnings in your pocket',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
];

export default function Advantages() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl font-bold mb-4"
            style={{
              background: 'var(--theme-text-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Why Choose Weekend Millions?
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Experience the future of lottery gaming on the blockchain
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon;

            return (
              <motion.div
                key={advantage.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: `0 20px 40px rgba(var(--theme-neon-color-rgb), 0.2)`,
                }}
                className="relative p-6 rounded-2xl group cursor-pointer"
                style={{
                  background: 'var(--glass-background)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: advantage.gradient,
                    filter: 'blur(20px)',
                    zIndex: -1,
                  }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: advantage.gradient,
                  }}
                >
                  <Icon size={28} color="#fff" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {advantage.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {advantage.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
