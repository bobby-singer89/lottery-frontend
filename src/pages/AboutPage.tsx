import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { CONTACT_CONFIG } from '../config/contact';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header />
        
        <main className="main-content">
          <div className="about-page">
            <motion.div
              className="about-container"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="about-title neon-text"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                О проекте Weekend Millions
              </motion.h1>

              <div className="about-content glass-card">
                <section className="about-section">
                  <h2 className="section-title">Что такое Weekend Millions?</h2>
                  <p className="section-text">
                    Weekend Millions — это современная децентрализованная лотерейная платформа,
                    построенная на блокчейне TON. Мы предлагаем честные розыгрыши с прозрачными
                    правилами и мгновенными выплатами победителям.
                  </p>
                </section>

                <section className="about-section">
                  <h2 className="section-title">Наши преимущества</h2>
                  <ul className="features-list">
                    <li className="feature-item">
                      <span className="feature-icon">⚡</span>
                      <div>
                        <strong>Мгновенные выплаты</strong>
                        <p>Выигрыш автоматически поступает на ваш кошелек через смарт-контракт</p>
                      </div>
                    </li>
                    <li className="feature-item">
                      <span className="feature-icon">🔒</span>
                      <div>
                        <strong>Блокчейн прозрачность</strong>
                        <p>Все транзакции и розыгрыши записываются в открытый блокчейн TON</p>
                      </div>
                    </li>
                    <li className="feature-item">
                      <span className="feature-icon">🎲</span>
                      <div>
                        <strong>Честный рандом</strong>
                        <p>Победители определяются смарт-контрактом, исключая любые манипуляции</p>
                      </div>
                    </li>
                    <li className="feature-item">
                      <span className="feature-icon">💎</span>
                      <div>
                        <strong>Низкие комиссии</strong>
                        <p>Благодаря технологии TON, комиссии минимальны</p>
                      </div>
                    </li>
                  </ul>
                </section>

                <section className="about-section">
                  <h2 className="section-title">Как это работает?</h2>
                  <div className="steps-grid">
                    <div className="step-card glass-container">
                      <div className="step-number">1</div>
                      <h3>Подключите кошелек</h3>
                      <p>Используйте TON Connect для входа</p>
                    </div>
                    <div className="step-card glass-container">
                      <div className="step-number">2</div>
                      <h3>Купите билет</h3>
                      <p>Выберите лотерею и приобретите билет в TON или USDT</p>
                    </div>
                    <div className="step-card glass-container">
                      <div className="step-number">3</div>
                      <h3>Дождитесь розыгрыша</h3>
                      <p>Розыгрыш проходит автоматически в указанное время</p>
                    </div>
                    <div className="step-card glass-container">
                      <div className="step-number">4</div>
                      <h3>Получите выигрыш</h3>
                      <p>Призы автоматически отправляются победителям</p>
                    </div>
                  </div>
                </section>

                <section className="about-section">
                  <h2 className="section-title">Контакты</h2>
                  <p className="section-text">
                    Есть вопросы? Свяжитесь с нами:
                  </p>
                  <div className="contact-links">
                    <a href={CONTACT_CONFIG.telegram} className="contact-link glass-btn" target="_blank" rel="noopener noreferrer">
                      Telegram
                    </a>
                    <a href={`mailto:${CONTACT_CONFIG.email}`} className="contact-link glass-btn">
                      Email
                    </a>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        </main>
        
        <Footer activeTab="about" />
      </div>
    </div>
  );
}
