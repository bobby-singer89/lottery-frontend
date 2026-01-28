import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { WEEKEND_SPECIAL_CONFIG } from '../config/lottery';
import { lotteryClient, type LotteryInfo, type NextDraw } from '../lib/api/lotteryClient';
import { useTonTransaction } from '../hooks/useTonTransaction';
import { useAuth } from '../contexts/AuthContext';
import { useTicketCart } from '../hooks/useTicketCart';
import CountdownTimer from '../components/Statistics/CountdownTimer';
import NumberGrid from '../components/Lottery/NumberGrid/NumberGrid';
import TicketPreview from '../components/Lottery/TicketPreview/TicketPreview';
import PurchaseModal from '../components/Lottery/PurchaseModal/PurchaseModal';
import TicketCart from '../components/Lottery/TicketCart/TicketCart';
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
  const [participantsCount] = useState(() => Math.floor(Math.random() * 300 + 200));
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Initialize cart with ticket price
  const ticketPrice = lottery?.ticketPrice || WEEKEND_SPECIAL_CONFIG.ticketPrice;
  const cart = useTicketCart(ticketPrice);

  const loadLotteryInfo = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadLotteryInfo();
  }, [loadLotteryInfo]);

  const handlePurchase = async (txBoc?: string) => {
    if (!lottery) return;
    if (!tonConnectUI.account?.address) {
      throw new Error(t('walletNotConnected', { defaultValue: 'Кошелёк не подключен' }));
    }

    try {
      const actualPrice = lottery.ticketPrice || WEEKEND_SPECIAL_CONFIG.ticketPrice;
      
      // Check if purchasing from cart or single ticket
      if (cart.tickets.length > 0) {
        // For cart purchases, txBoc should be provided by TicketCart
        // If not provided, send transaction using existing method
        let txHash = txBoc;
        if (!txHash) {
          txHash = await buyLotteryTicket(
            lottery.lotteryWallet || WEEKEND_SPECIAL_CONFIG.lotteryWallet,
            cart.total,
            cart.tickets[0].numbers // First ticket numbers for transaction memo
          );
        }

        // Register all tickets on backend
        await lotteryClient.buyTickets(WEEKEND_SPECIAL_CONFIG.slug, {
          tickets: cart.tickets.map(ticket => ({ selectedNumbers: ticket.numbers })),
          txHash,
          walletAddress: tonConnectUI.account.address,
          totalAmount: cart.total,
          discount: cart.discount
        });

        // Note: cart.clearCart() is now called by TicketCart component if txBoc was provided
        if (!txBoc) {
          cart.clearCart();
        }
      } else if (selectedNumbers.length > 0) {
        // For single ticket purchase from modal
        let txHash = txBoc;
        if (!txHash) {
          txHash = await buyLotteryTicket(
            lottery.lotteryWallet || WEEKEND_SPECIAL_CONFIG.lotteryWallet,
            actualPrice,
            selectedNumbers
          );
        }

        // Register ticket on backend
        await lotteryClient.buyTicket(WEEKEND_SPECIAL_CONFIG.slug, {
          selectedNumbers,
          txHash,
          walletAddress: tonConnectUI.account.address
        });

        // Clear selection
        setSelectedNumbers([]);
      }

      // Refresh tickets list
      setTicketsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  const handleConnectWallet = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

  const handleAddToCart = (numbers: number[]) => {
    cart.addTicket(numbers);
  };

  const handleBuyTicketClick = () => {
    if (selectedNumbers.length !== WEEKEND_SPECIAL_CONFIG.numbersToSelect) {
      // Instead of alert, we could show a toast or inline message
      // For now keeping simple validation
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseFromCart = async (txBoc?: string) => {
    // Backend registration is handled when txBoc is provided from TicketCart
    if (txBoc && cart.tickets.length > 0 && tonConnectUI.account?.address && lottery) {
      try {
        await lotteryClient.buyTickets(WEEKEND_SPECIAL_CONFIG.slug, {
          tickets: cart.tickets.map(ticket => ({ selectedNumbers: ticket.numbers })),
          txHash: txBoc,
          walletAddress: tonConnectUI.account.address,
          totalAmount: cart.total,
          discount: cart.discount
        });
        
        // Refresh tickets list
        setTicketsRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error('Failed to register tickets on backend:', error);
        // Re-throw to let TicketCart show error
        throw error;
      }
    }
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
            👥 {t('participants', { defaultValue: 'Участников' })}: {participantsCount}
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
            onAddToCart={handleAddToCart}
            showAddToCart={true}
          />
        </div>

        {/* Ticket Preview - only show for quick single purchase */}
        {selectedNumbers.length > 0 && cart.tickets.length === 0 && (
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

      {/* Ticket Cart */}
      <TicketCart
        tickets={cart.tickets}
        onRemoveTicket={cart.removeTicket}
        onClearCart={cart.clearCart}
        subtotal={cart.subtotal}
        discount={cart.discount}
        discountPercent={cart.discountPercent}
        total={cart.total}
        onPurchase={handlePurchaseFromCart}
        isOpen={isCartOpen}
        onToggle={() => setIsCartOpen(!isCartOpen)}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        lotteryName={lotteryData.name}
        selectedNumbers={cart.tickets.length > 0 ? undefined : selectedNumbers}
        tickets={cart.tickets.length > 0 ? cart.tickets : undefined}
        ticketPrice={lotteryData.ticketPrice}
        discount={cart.discount}
        total={cart.tickets.length > 0 ? cart.total : lotteryData.ticketPrice}
        onPurchase={handlePurchase}
        onConnectWallet={handleConnectWallet}
      />
    </div>
  );
}
