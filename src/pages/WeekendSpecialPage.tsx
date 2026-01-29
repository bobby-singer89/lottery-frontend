import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { WEEKEND_SPECIAL_CONFIG } from '../config/lottery';
import { lotteryClient, type LotteryInfo, type NextDraw } from '../lib/api/lotteryClient';
import { useTonTransaction } from '../hooks/useTonTransaction';
import { useTicketCart } from '../hooks/useTicketCart';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import PurchaseModal from '../components/Lottery/PurchaseModal/PurchaseModal';
import {
  JackpotDisplay,
  DrawCountdown,
  TicketsSoldCounter,
  AccordionSection,
  GoldenParticles,
  CartPreview,
  CartModal,
  CompactNumberGrid,
} from '../components/WeekendSpecial';
import './WeekendSpecialPage.css';

export default function WeekendSpecialPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { buyLotteryTicket } = useTonTransaction();

  const [lottery, setLottery] = useState<LotteryInfo | null>(null);
  const [nextDraw, setNextDraw] = useState<NextDraw | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participantsCount] = useState(() => Math.floor(Math.random() * 300 + 200));
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  
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
    setSelectedNumbers([]);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 10, 30]);
    }
  };

  const handleQuickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < WEEKEND_SPECIAL_CONFIG.numbersToSelect) {
      const num = Math.floor(Math.random() * WEEKEND_SPECIAL_CONFIG.numbersPool) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const handleClear = () => {
    setSelectedNumbers([]);
  };

  const handleNumberToggle = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < WEEKEND_SPECIAL_CONFIG.numbersToSelect) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleCartCheckout = async () => {
    if (cart.tickets.length === 0) return;
    
    setIsCartModalOpen(false);
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
      <GoldenParticles count={15} enabled={true} />
      
      <div className="page-content">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate('/')}>
          ← {t('back', { defaultValue: 'Назад' })}
        </button>

        {/* Header */}
        <div className="ws-header">
          <h1 className="ws-page-title">Weekend Special</h1>
        </div>

        {/* Jackpot Display with Steampunk Glitch */}
        <JackpotDisplay 
          initialJackpot={lotteryData.currentJackpot || 5000}
          enableRealTimeUpdates={true}
        />

        {/* Draw Countdown */}
        {nextDraw && (
          <DrawCountdown 
            targetDate={new Date(nextDraw.scheduledAt)}
            drawNumber={1}
          />
        )}

        {/* Tickets Sold Counter */}
        <TicketsSoldCounter count={participantsCount} />

        {/* How to Play Accordion */}
        <AccordionSection icon="❓" title="Как играть" defaultOpen={false}>
          <ol className="ws-rules">
            <li>Выберите 5 чисел от 1 до 36</li>
            <li>Добавьте билет в корзину</li>
            <li>Выберите столько билетов, сколько хотите</li>
            <li>Оплатите билеты (1 TON за билет)</li>
            <li>Дождитесь розыгрыша</li>
            <li>Выиграйте до 500 TON!</li>
          </ol>
        </AccordionSection>

        {/* Prizes Accordion */}
        <AccordionSection icon="🎁" title="Призы" defaultOpen={false}>
          <div className="ws-prizes-grid">
            {Object.entries(lotteryData.prizeStructure || WEEKEND_SPECIAL_CONFIG.prizes)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([matches, prize]) => (
                <div key={matches} className="ws-prize-item">
                  <span className="ws-prize-match">
                    {matches === '5' && '💎'}
                    {matches === '4' && '🥇'}
                    {matches === '3' && '🥈'}
                    {matches === '2' && '🥉'}
                    {matches === '1' && '🎫'}
                    {' '}
                    {matches} из 5
                  </span>
                  <span className="ws-prize-amount">
                    {typeof prize === 'number' 
                      ? `${prize} TON` 
                      : t('freeTicket', { defaultValue: 'Бесплатный билет' })}
                  </span>
                </div>
              ))}
          </div>
        </AccordionSection>

        {/* Number Selection Section */}
        <div className="ws-selection-section">
          <CompactNumberGrid
            selected={selectedNumbers}
            onToggle={handleNumberToggle}
            maxSelection={WEEKEND_SPECIAL_CONFIG.numbersToSelect}
            totalNumbers={WEEKEND_SPECIAL_CONFIG.numbersPool}
            onQuickPick={handleQuickPick}
            onClear={handleClear}
            onAddToCart={selectedNumbers.length === WEEKEND_SPECIAL_CONFIG.numbersToSelect ? () => handleAddToCart(selectedNumbers) : undefined}
          />
        </div>
      </div>

      {/* Cart Preview (Floating) */}
      <CartPreview
        ticketCount={cart.tickets.length}
        totalCost={cart.total}
        onOpenCart={() => setIsCartModalOpen(true)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        tickets={cart.tickets}
        onRemove={cart.removeTicket}
        onClear={cart.clearCart}
        onCheckout={handleCartCheckout}
        total={cart.total}
        discount={cart.discount}
        discountPercent={cart.discountPercent}
        subtotal={cart.subtotal}
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
