import React, { useEffect, useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import HotNumbersCard from '../components/analytics/HotNumbersCard';
import ColdNumbersCard from '../components/analytics/ColdNumbersCard';
import BiggestWinsCard from '../components/analytics/BiggestWinsCard';
import DrawHistoryChart from '../components/analytics/DrawHistoryChart';
import WinProbabilityCard from '../components/analytics/WinProbabilityCard';
import AllTimeStatsCard from '../components/analytics/AllTimeStatsCard';
import './AnalyticsPage.css';

interface HotColdNumber {
  number: number;
  frequency: number;
}

interface Winner {
  id?: string;
  amount: number;
  lottery: string;
  walletAddress: string;
  date: string;
}

interface HistoryData {
  date: string;
  label: string;
  count: number;
  percentage: number;
}

interface Stats {
  totalDraws: number;
  totalWinners: number;
  totalPrizePool: number;
  avgWin: number;
  biggestWin: number;
  mostPopularNumbers: number[];
  winRate: number;
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Data states
  const [hotNumbers, setHotNumbers] = useState<HotColdNumber[]>([]);
  const [coldNumbers, setColdNumbers] = useState<HotColdNumber[]>([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalDraws: 0,
    totalWinners: 0,
    totalPrizePool: 0,
    avgWin: 0,
    biggestWin: 0,
    mostPopularNumbers: [],
    winRate: 0,
  });

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Fetch all analytics data in parallel
      const [hotColdRes, winsRes, historyRes, statsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/analytics/hot-cold-numbers`),
        fetch(`${apiBaseUrl}/api/analytics/biggest-wins`),
        fetch(`${apiBaseUrl}/api/analytics/draw-history?days=7`),
        fetch(`${apiBaseUrl}/api/analytics/all-time-stats`),
      ]);

      const hotColdData = await hotColdRes.json();
      const winsData = await winsRes.json();
      const historyData = await historyRes.json();
      const statsData = await statsRes.json();

      if (hotColdData.success) {
        setHotNumbers(hotColdData.hotNumbers || []);
        setColdNumbers(hotColdData.coldNumbers || []);
        setTotalDraws(hotColdData.totalDraws || 10);
      }

      if (winsData.success) {
        setWinners(winsData.winners || []);
      }

      if (historyData.success) {
        setHistory(historyData.history || []);
        setTotalTickets(historyData.totalTickets || 0);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Navigation will be handled by Footer component
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <AnimatedBackground />
        <div className="content-wrapper">
          <Header />
          <main className="main-content">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading analytics...</p>
            </div>
          </main>
          <Footer activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <AnimatedBackground />
        <div className="content-wrapper">
          <Header />
          <main className="main-content">
            <div className="error-state">
              <h2>⚠️ Error</h2>
              <p>{error}</p>
              <button className="glass-button" onClick={loadAnalyticsData}>
                Retry
              </button>
            </div>
          </main>
          <Footer activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <AnimatedBackground />
      <div className="content-wrapper">
        <Header />
        
        <main className="main-content">
          <div className="analytics-header">
            <h1 className="analytics-title">📊 Lottery Analytics</h1>
            <p className="analytics-subtitle">
              Comprehensive statistics and insights from all lottery draws
            </p>
          </div>

          <div className="analytics-grid">
            {/* Hot Numbers */}
            {hotNumbers.length > 0 && (
              <HotNumbersCard numbers={hotNumbers} totalDraws={totalDraws} />
            )}

            {/* Cold Numbers */}
            {coldNumbers.length > 0 && (
              <ColdNumbersCard numbers={coldNumbers} totalDraws={totalDraws} />
            )}

            {/* Biggest Wins */}
            {winners.length > 0 && <BiggestWinsCard winners={winners} />}

            {/* Win Probability */}
            <WinProbabilityCard />

            {/* Draw History Chart */}
            {history.length > 0 && (
              <DrawHistoryChart 
                history={history} 
                totalTickets={totalTickets} 
                days={7}
              />
            )}

            {/* All-Time Stats */}
            <AllTimeStatsCard stats={stats} />
          </div>
        </main>

        <Footer activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
