import { useCallback } from 'react';
import { analytics, trackEvent } from '@/lib/posthog';

export const useAnalytics = () => {
  const track = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    trackEvent(eventName, properties);
  }, []);

  return {
    track,
    ...analytics,
  };
};

export default useAnalytics;
