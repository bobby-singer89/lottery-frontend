import { motion } from 'framer-motion';
import SwapWidget from '../components/Swap/SwapWidget';
import './SwapPage.css';

export default function SwapPage() {
  return (
    <div className="swap-page">
      <motion.div
        className="swap-page-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>💱 Обмен валют</h1>
        <p className="subtitle">
          Обменяйте TON на USDT или наоборот для участия в лотереях
        </p>

        <SwapWidget />

        <div className="swap-info">
          <h3>ℹ️ Как это работает?</h3>
          <ul>
            <li>✅ Обмен происходит через <strong>DeDust DEX</strong></li>
            <li>✅ Вы полностью контролируете свои средства</li>
            <li>✅ Комиссия DeDust: <strong>0.3%</strong></li>
            <li>✅ Транзакция выполняется мгновенно</li>
            <li>✅ Лучшие курсы благодаря ликвидности DEX</li>
          </ul>
        </div>

        <div className="swap-features">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h4>Безопасно</h4>
            <p>Транзакция подписывается только вами через TON Connect</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Быстро</h4>
            <p>Обмен выполняется за несколько секунд</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h4>Выгодно</h4>
            <p>Минимальные комиссии и лучшие курсы</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
