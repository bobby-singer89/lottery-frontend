import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { adminApiClient } from '../../lib/api/adminClient';
import './AdminGuard.css';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Redirect to admin login if not authenticated
      if (!isAuthenticated || !user) {
        navigate('/admin/login');
        return;
      }

      try {
        setIsCheckingAdmin(true);
        const response = await adminApiClient.checkAdminStatus();
        
        if (response.success && response.isAdmin) {
          setIsAdmin(true);
        } else {
          // Not an admin, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        // On error, redirect to home for security
        navigate('/');
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminAccess();
  }, [user, isAuthenticated, authLoading, navigate]);

  // Show loading state
  if (authLoading || isCheckingAdmin) {
    return (
      <div className="admin-guard-loading">
        <motion.div
          className="admin-guard-spinner"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#admin-spinner-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="80 40"
            />
            <defs>
              <linearGradient id="admin-spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#df600c" />
                <stop offset="50%" stopColor="#f45da6" />
                <stop offset="100%" stopColor="#9e0ac7" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
        <p className="admin-guard-text">Проверка доступа...</p>
      </div>
    );
  }

  // If admin check passed, render children
  if (isAdmin) {
    return <>{children}</>;
  }

  // Default: don't render anything (will redirect)
  return null;
}
