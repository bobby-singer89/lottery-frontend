import { useState, useEffect } from 'react';
import { useTonAddress } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './TransactionHistoryPage.css';

type TransactionType = 'ticket_purchase' | 'prize_payout' | 'swap' | 'deposit' | 'withdrawal';
type TransactionStatus = 'pending' | 'success' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: 'TON' | 'USDT';
  description: string;
  txHash: string;
  status: TransactionStatus;
  timestamp: Date;
  details?: any;
}

export default function TransactionHistoryPage() {
  const navigate = useNavigate();
  const userAddress = useTonAddress();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userAddress) {
      loadTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [userAddress]);

  async function loadTransactions() {
    if (!userAddress) return;

    setIsLoading(true);

    try {
      // TODO: Implement real API call
      // const data = await transactionApi.getUserTransactions(userAddress);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(getMockTransactions());
      
      console.log(`📊 Loaded transactions for ${userAddress}`);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function getMockTransactions(): Transaction[] {
    return [
      {
        id: '1',
        type: 'ticket_purchase',
        amount: -1,
        currency: 'TON',
        description: 'Weekend Special #12345',
        txHash: '0xabc123def456',
        status: 'success',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'swap',
        amount: -5,
        currency: 'TON',
        description: '5 TON → 26 USDT',
        txHash: '0xdef456ghi789',
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        type: 'prize_payout',
        amount: 50,
        currency: 'TON',
        description: 'Mega Jackpot #10001',
        txHash: '0xghi789jkl012',
        status: 'success',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        type: 'ticket_purchase',
        amount: -10,
        currency: 'TON',
        description: 'Mega Jackpot #10002',
        txHash: '0xjkl012mno345',
        status: 'success',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type === filter
  );

  function getTypeIcon(type: TransactionType): string {
    const icons: Record<TransactionType, string> = {
      ticket_purchase: '🎫',
      prize_payout: '🎉',
      swap: '🔄',
      deposit: '⬇️',
      withdrawal: '⬆️',
    };
    return icons[type];
  }

  function getTypeName(type: TransactionType): string {
    const names: Record<TransactionType, string> = {
      ticket_purchase: 'Покупка билета',
      prize_payout: 'Выигрыш',
      swap: 'Обмен',
      deposit: 'Пополнение',
      withdrawal: 'Вывод',
    };
    return names[type];
  }

  function getTonExplorerLink(txHash: string): string {
    return `https://tonscan.org/tx/${txHash}`;
  }

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дней назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="transaction-history-page">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={() => {}} />
        
        <main className="main-content">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Назад
            </button>
            <h1 className="page-title">📜 История транзакций</h1>
          </div>

          {!userAddress ? (
            <div className="connect-prompt">
              <p>Подключите кошелёк для просмотра истории</p>
            </div>
          ) : (
            <>
              <div className="filter-tabs">
                <button
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => setFilter('all')}
                >
                  Все
                </button>
                <button
                  className={filter === 'ticket_purchase' ? 'active' : ''}
                  onClick={() => setFilter('ticket_purchase')}
                >
                  🎫 Покупки
                </button>
                <button
                  className={filter === 'prize_payout' ? 'active' : ''}
                  onClick={() => setFilter('prize_payout')}
                >
                  🎉 Выигрыши
                </button>
                <button
                  className={filter === 'swap' ? 'active' : ''}
                  onClick={() => setFilter('swap')}
                >
                  🔄 Обмен
                </button>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Загрузка транзакций...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📜</div>
                  <h2>Нет транзакций</h2>
                  <p>Ваши транзакции появятся здесь</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      className={`transaction-item ${tx.type}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="tx-icon">
                        {getTypeIcon(tx.type)}
                      </div>
                      
                      <div className="tx-info">
                        <div className="tx-type">
                          {getTypeName(tx.type)}
                        </div>
                        <div className="tx-description">
                          {tx.description}
                        </div>
                        <div className="tx-date">
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>

                      <div className="tx-amount">
                        <div className={`amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                        </div>
                        <div className="tx-status">
                          {tx.status === 'success' ? '✅ Успешно' : 
                           tx.status === 'pending' ? '⏳ Ожидание' : 
                           '❌ Ошибка'}
                        </div>
                      </div>

                      <a
                        href={getTonExplorerLink(tx.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                        title="View on TON Explorer"
                      >
                        🔗
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
        
        <Footer activeTab="history" onTabChange={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'lotteries') navigate('/lotteries');
          else if (tab === 'history') navigate('/history');
          else if (tab === 'profile') navigate('/profile');
          else if (tab === 'referral') navigate('/referral');
        }} />
      </div>
    </div>
  );
}
