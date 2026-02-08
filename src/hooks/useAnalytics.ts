import { useCallback } from 'react';
import { analytics, trackEvent } from '@/lib/posthog';
import { marketing } from '@/lib/marketing';
import { useUTM } from './useUTM';

export const useAnalytics = () => {
  const { utmParams, getForAnalytics } = useUTM();

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    // Автоматически добавляем UTM параметры к каждому событию
    trackEvent(eventName, {
      ...properties,
      ...getForAnalytics(),
    });
  }, [getForAnalytics]);

  return {
    track,
    utmParams,
    ...analytics,
    marketing,
  };
};

export default useAnalytics;
