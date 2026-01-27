import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import ReferralQR from '../components/Referral/ReferralQR';
import ReferralProgress from '../components/Referral/ReferralProgress';
import ReferralTree from '../components/Referral/ReferralTree';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';
import './ReferralPage.css';

function ReferralPage() {
  const { navigateToTab } = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('referral');
  const [copied, setCopied] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigateToTab(tab);
  };

  const handleConnect = () => {
    console.log('Connecting wallet...');
  };

  const referralLink = user?.referralCode
    ? `https://t.me/lottery_bot?start=${user.referralCode}`
    : 'Not available';

  const copyReferralLink = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="app-root">
      <AnimatedBackground />
      
      <div className="content-wrapper">
        <Header onConnect={handleConnect} />
        
        <main className="main-content referral-page">
          <motion.div
            className="referral-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="referral-header">
              <h1>Referral Program</h1>
              <p className="referral-subtitle">
                Invite friends and earn rewards together
              </p>
            </div>

            {/* Referral Link Card */}
            <motion.div
              className="referral-link-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3>Your Referral Link</h3>
              <div className="link-display">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="link-input"
                />
                <button
                  className="copy-button"
                  onClick={copyReferralLink}
                  disabled={!user?.referralCode}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="link-info">
                Share this link with friends to earn rewards when they join
              </p>
            </motion.div>

            {/* Referral QR Code */}
            <div className="referral-section">
              <h2>QR Code</h2>
              <ReferralQR />
            </div>

            {/* Referral Progress */}
            <div className="referral-section">
              <h2>Your Referral Progress</h2>
              <ReferralProgress />
            </div>

            {/* Referral Tree */}
            <div className="referral-section">
              <h2>Your Referral Network</h2>
              <ReferralTree />
            </div>

            {/* Referral Benefits */}
            <motion.div
              className="benefits-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3>How It Works</h3>
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-number">1</div>
                  <div className="benefit-content">
                    <h4>Share Your Link</h4>
                    <p>Send your unique referral link to friends</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-number">2</div>
                  <div className="benefit-content">
                    <h4>They Join</h4>
                    <p>Friends sign up using your referral code</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-number">3</div>
                  <div className="benefit-content">
                    <h4>Earn Rewards</h4>
                    <p>Get bonus TON for each successful referral</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
}

export default ReferralPage;
