import { useState, useEffect } from 'react';
import { useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { getWalletBalance } from '../../lib/api/wallet';
import { getUserBalance } from '../../lib/api/user';
import './BalanceCards.css';

export default function BalanceCards() {
  const wallet = useTonWallet();
  const address = useTonAddress();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [appBalance, setAppBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, address]);

  async function loadBalances() {
    setLoading(true);
    try {
      // Get app balance (winnings)
      const userBalance = await getUserBalance();
      setAppBalance(userBalance.balance || 0);

      // Get wallet balance if connected
      if (address) {
        const walletData = await getWalletBalance(address);
        setWalletBalance(walletData.balance);
      } else {
        setWalletBalance(null);
      }
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  }

  function handleWithdraw() {
    // TODO: Open withdraw modal
    console.log('Open withdraw modal');
  }

  return (
    <div className="balance-cards">
      {/* Wallet Balance Card */}
      <div className="balance-card">
        <div className="balance-card-amount">
          💎 {loading ? '...' : walletBalance !== null ? `${walletBalance.toFixed(2)} TON` : '—'}
        </div>
        <div className="balance-card-label">Кошелёк</div>
        {address && (
          <div className="balance-card-address">{formatAddress(address)}</div>
        )}
        {!wallet && (
          <div className="balance-card-hint">Не подключён</div>
        )}
      </div>

      {/* App Balance (Winnings) Card */}
      <div className="balance-card">
        <div className="balance-card-amount">
          🏆 {loading ? '...' : `${appBalance.toFixed(2)} TON`}
        </div>
        <div className="balance-card-label">Выигрыши</div>
        {appBalance > 0 && (
          <button className="balance-card-withdraw" onClick={handleWithdraw}>
            Вывести
          </button>
        )}
      </div>
    </div>
  );
}
