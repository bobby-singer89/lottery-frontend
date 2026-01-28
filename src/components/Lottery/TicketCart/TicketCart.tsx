import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../../Advanced/SoundManager';
import type { CartTicket } from '../../../hooks/useTicketCart';
import './TicketCart.css';

interface TicketCartProps {
  tickets: CartTicket[];
  onRemoveTicket: (id: string) => void;
  onClearCart: () => void;
  subtotal: number;
  discount: number;
  discountPercent: number;
  total: number;
  onPurchase: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function TicketCart({
  tickets,
  onRemoveTicket,
  onClearCart,
  subtotal,
  discount,
  discountPercent,
  total,
  onPurchase,
  isOpen,
  onToggle
}: TicketCartProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();

  const handleRemove = (id: string) => {
    onRemoveTicket(id);
    playSound('click');
  };

  const handleClear = () => {
    onClearCart();
    playSound('click');
  };

  const handlePurchase = () => {
    onPurchase();
    playSound('click');
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        className="cart-toggle-btn"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="cart-icon">🛒</span>
        {tickets.length > 0 && (
          <motion.span
            className="cart-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={tickets.length}
          >
            {tickets.length}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />

            {/* Cart Panel */}
            <motion.div
              className="cart-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="cart-header">
                <h2 className="cart-title">
                  🛒 {t('cart', { defaultValue: 'Корзина' })} ({tickets.length})
                </h2>
                <button className="cart-close-btn" onClick={onToggle}>
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="cart-content">
                {tickets.length === 0 ? (
                  <div className="cart-empty">
                    <div className="empty-icon">🎫</div>
                    <p className="empty-text">
                      {t('cartEmpty', { defaultValue: 'Корзина пуста' })}
                    </p>
                    <p className="empty-subtext">
                      {t('addTicketsToCart', { 
                        defaultValue: 'Выберите числа и добавьте билеты в корзину' 
                      })}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Tickets List */}
                    <div className="cart-tickets">
                      <AnimatePresence>
                        {tickets.map((ticket, index) => (
                          <motion.div
                            key={ticket.id}
                            className="cart-ticket-item"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="ticket-info">
                              <span className="ticket-label">
                                {t('ticket', { defaultValue: 'Билет' })} {index + 1}:
                              </span>
                              <div className="ticket-numbers">
                                {ticket.numbers.map((num) => (
                                  <span key={num} className="ticket-ball">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button
                              className="ticket-remove-btn"
                              onClick={() => handleRemove(ticket.id)}
                              title={t('remove', { defaultValue: 'Удалить' })}
                            >
                              🗑️
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Price Summary */}
                    <div className="cart-summary">
                      <div className="summary-row">
                        <span className="summary-label">
                          {t('subtotal', { defaultValue: 'Сумма' })}:
                        </span>
                        <span className="summary-value">{subtotal.toFixed(2)} TON</span>
                      </div>

                      {discount > 0 && (
                        <motion.div
                          className="summary-row discount-row"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <span className="summary-label">
                            {t('discount', { defaultValue: 'Скидка' })} {discountPercent}%:
                          </span>
                          <span className="summary-value discount-value">
                            -{discount.toFixed(2)} TON 🎁
                          </span>
                        </motion.div>
                      )}

                      <div className="summary-divider"></div>

                      <div className="summary-row total-row">
                        <span className="summary-label">
                          {t('total', { defaultValue: 'Итого' })}:
                        </span>
                        <span className="summary-total">{total.toFixed(2)} TON</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="cart-actions">
                      <button
                        className="clear-cart-btn"
                        onClick={handleClear}
                      >
                        {t('clearCart', { defaultValue: 'Очистить корзину' })}
                      </button>
                      <motion.button
                        className="purchase-cart-btn"
                        onClick={handlePurchase}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🎫 {t('buyTickets', { defaultValue: 'Купить билеты' })}
                      </motion.button>
                    </div>

                    {/* Discount Info */}
                    {tickets.length >= 5 && (
                      <motion.div
                        className="discount-info"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        🎉 {t('discountApplied', { 
                          defaultValue: 'Скидка 5% применена!' 
                        })}
                      </motion.div>
                    )}
                    {tickets.length >= 3 && tickets.length < 5 && (
                      <motion.div
                        className="discount-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        💡 {t('discountHint', { 
                          defaultValue: 'Добавьте ещё {{count}} билета для скидки 5%',
                          count: 5 - tickets.length
                        })}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
