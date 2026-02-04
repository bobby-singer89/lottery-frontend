import { motion } from 'framer-motion';
import './AnimatedBenefits.css';

interface Benefit {
  icon: string;
  title: string;
  desc: string;
}

const benefits: Benefit[] = [
  {
    icon: '⚡',
    title: 'Мгновенные выплаты',
    desc: 'Выигрыш на кошелёк за секунды',
  },
  {
    icon: '🔒',
    title: 'Блокчейн прозрачность',
    desc: 'Все транзакции в открытом доступе',
  },
  {
    icon: '🎲',
    title: 'Честный рандом',
    desc: 'Генерация на смарт-контракте TON',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function AnimatedBenefits() {
  return (
    <motion.div
      className="animated-benefits"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          className="benefit-card glass-card"
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.02 }}
        >
          <motion.div
            className="benefit-icon"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            {benefit.icon}
          </motion.div>
          <h3 className="benefit-title">{benefit.title}</h3>
          <p className="benefit-desc">{benefit.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
