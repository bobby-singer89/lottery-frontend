import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { WEEKEND_SPECIAL_CONFIG } from '../config/lottery';
import { lotteryClient, type LotteryInfo, type NextDraw } from '../lib/api/lotteryClient';
import { useTonTransaction } from '../hooks/useTonTransaction';
import { useAuth } from '../contexts/AuthContext';
import CountdownTimer from '../components/Statistics/CountdownTimer';
import NumberGrid from '../components/Lottery/NumberGrid/NumberGrid';
import TicketPreview from '../components/Lottery/TicketPreview/TicketPreview';
import PurchaseModal from '../components/Lottery/PurchaseModal/PurchaseModal';
import MyTickets from '../components/Lottery/MyTickets/MyTickets';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './WeekendSpecialPage.css';

export default function WeekendSpecialPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tonConnectUI] = useTonConnectUI();
  const { buyLotteryTicket } = useTonTransaction();

  const [lottery, setLottery] = useState<LotteryInfo | null>(null);
  const [nextDraw, setNextDraw] = useState<NextDraw | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ticketsRefreshTrigger, setTicketsRefreshTrigger] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    loadLotteryInfo();
  }, []);

  const loadLotteryInfo = async () => {
    setIsLoading(true);
    try {
      const response = await lotteryClient.getLotteryInfo(WEEKEND_SPECIAL_CONFIG.slug);
      setLottery(response.lottery);
      setNextDraw(response.nextDraw);
    } catch (error) {
      console.error('Failed to load lottery info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!lottery) return;

    try {
      // Send TON transaction
      const txHash = await buyLotteryTicket(
        lottery.lotteryWallet || WEEKEND_SPECIAL_CONFIG.lotteryWallet,
        lottery.ticketPrice || WEEKEND_SPECIAL_CONFIG.ticketPrice,
        selectedNumbers
      );

      // Register ticket on backend
      await lotteryClient.buyTicket(WEEKEND_SPECIAL_CONFIG.slug, {
        selectedNumbers,
        txHash,
        walletAddress: tonConnectUI.account?.address || ''
      });

      // Refresh tickets list
      setTicketsRefreshTrigger(prev => prev + 1);
      
      // Clear selection
      setSelectedNumbers([]);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  const handleBuyTicketClick = () => {
    if (selectedNumbers.length !== WEEKEND_SPECIAL_CONFIG.numbersToSelect) {
      alert(t('selectAllNumbers', { 
        defaultValue: `Выберите ${WEEKEND_SPECIAL_CONFIG.numbersToSelect} чисел` 
      }));
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="weekend-special-page">
        <AnimatedBackground />
        <div className="page-content loading-state">
          <div className="loader-spinner"></div>
          <p>{t('loading', { defaultValue: 'Загрузка...' })}</p>
        </div>
      </div>
    );
  }

  const lotteryData: LotteryInfo = lottery || {
    id: 'weekend-special',
    slug: WEEKEND_SPECIAL_CONFIG.slug,
    name: WEEKEND_SPECIAL_CONFIG.name,
    numbersToSelect: WEEKEND_SPECIAL_CONFIG.numbersToSelect,
    numbersPool: WEEKEND_SPECIAL_CONFIG.numbersPool,
    ticketPrice: WEEKEND_SPECIAL_CONFIG.ticketPrice,
    lotteryWallet: WEEKEND_SPECIAL_CONFIG.lotteryWallet,
    currentJackpot: 5000,
    prizeStructure: WEEKEND_SPECIAL_CONFIG.prizes,
    isActive: true
  };

  return (
    <div className="weekend-special-page">
      <AnimatedBackground />
      
      <div className="page-content">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/')}>
          ← {t('back', { defaultValue: 'Назад' })}
        </button>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-logo">🎰</div>
          <h1 className="hero-title">{lotteryData.name}</h1>
          <p className="hero-subtitle">
            {t('selectNumbers', { defaultValue: 'Выберите 5 чисел из 36 и выиграйте джекпот!' })}
          </p>
          
          <div className="jackpot-display">
            <span className="jackpot-label">
              {t('jackpot', { defaultValue: 'Джекпот' })}
            </span>
            <span className="jackpot-amount">
              💎 {lotteryData.currentJackpot?.toLocaleString() || '5,000'} TON
            </span>
          </div>

          {nextDraw && (
            <div className="countdown-section">
              <CountdownTimer
                targetDate={new Date(nextDraw.scheduledAt)}
                onComplete={() => loadLotteryInfo()}
              />
            </div>
          )}

          <div className="participants-count">
            👥 {t('participants', { defaultValue: 'Участников' })}: {Math.floor(Math.random() * 500 + 200)}
          </div>
        </div>

        {/* Number Selection */}
        <div className="selection-section">
          <h2 className="section-title">
            {t('selectYourNumbers', { defaultValue: 'Выберите ваши числа' })}
          </h2>
          <NumberGrid
            maxNumbers={lotteryData.numbersToSelect}
            totalNumbers={lotteryData.numbersPool}
            selectedNumbers={selectedNumbers}
            onSelectionChange={setSelectedNumbers}
          />
        </div>

        {/* Ticket Preview */}
        {selectedNumbers.length > 0 && (
          <div className="preview-section">
            <TicketPreview
              lotteryName={lotteryData.name}
              selectedNumbers={selectedNumbers}
              ticketPrice={lotteryData.ticketPrice}
              drawDate={nextDraw?.scheduledAt}
              onEdit={() => setSelectedNumbers([])}
            />
            <button
              className="buy-ticket-btn"
              onClick={handleBuyTicketClick}
              disabled={selectedNumbers.length !== WEEKEND_SPECIAL_CONFIG.numbersToSelect}
            >
              🎫 {t('buyTicket', { defaultValue: 'Купить билет' })} — {lotteryData.ticketPrice} TON
            </button>
          </div>
        )}

        {/* Prize Structure */}
        <div className="prizes-section">
          <h2 className="section-title">
            💎 {t('prizeStructure', { defaultValue: 'Структура призов' })}
          </h2>
          <div className="prize-table">
            {Object.entries(lotteryData.prizeStructure || WEEKEND_SPECIAL_CONFIG.prizes)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([matches, prize]) => (
                <div key={matches} className="prize-row">
                  <div className="prize-match">
                    {matches === '5' && '💎'}
                    {matches === '4' && '🥇'}
                    {matches === '3' && '🥈'}
                    {matches === '2' && '🥉'}
                    {matches === '1' && '🎫'}
                    {' '}
                    {matches} {t('of', { defaultValue: 'из' })} 5
                  </div>
                  <div className="prize-amount">
                    {typeof prize === 'number' 
                      ? `${prize} TON` 
                      : t('freeTicket', { defaultValue: 'Бесплатный билет' })}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* How to Play */}
        <div className="how-to-play-section">
          <button 
            className="how-to-play-btn"
            onClick={() => setShowHowToPlay(!showHowToPlay)}
          >
            ❓ {t('howToPlay', { defaultValue: 'Как играть' })}
            <span className={`expand-icon ${showHowToPlay ? 'expanded' : ''}`}>▼</span>
          </button>
          
          {showHowToPlay && (
            <div className="how-to-play-content">
              <ol className="how-to-play-list">
                <li>{t('step1', { defaultValue: 'Выберите 5 чисел из 36' })}</li>
                <li>{t('step2', { defaultValue: 'Подключите TON кошелёк' })}</li>
                <li>{t('step3', { defaultValue: 'Купите билет за 1 TON' })}</li>
                <li>{t('step4', { defaultValue: 'Дождитесь розыгрыша' })}</li>
                <li>{t('step5', { defaultValue: 'Выигрыш автоматически зачислится на ваш кошелёк!' })}</li>
              </ol>
            </div>
          )}
        </div>

        {/* My Tickets */}
        {isAuthenticated && (
          <MyTickets 
            lotterySlug={WEEKEND_SPECIAL_CONFIG.slug}
            refreshTrigger={ticketsRefreshTrigger}
          />
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        lotteryName={lotteryData.name}
        selectedNumbers={selectedNumbers}
        ticketPrice={lotteryData.ticketPrice}
        onPurchase={handlePurchase}
        onConnectWallet={handleConnectWallet}
      />
    </div>
  );
}
