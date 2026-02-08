import { analytics, trackEvent } from '@/lib/posthog';

export const useAnalytics = () => {
  return {
    track: trackEvent,
    ...analytics,
  };
};

export default useAnalytics;
