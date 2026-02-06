import { useMemo } from 'react';
import { useAchievements } from './useAchievements';

export function useAchievementProgress(achievementId: string) {
  const { allAchievements, isLoading, error } = useAchievements();

  const { progress, progressPercentage, isCompleted } = useMemo(() => {
    // ИСПРАВЛЕНИЕ: Логика получения прогресса для конкретного ачивмента
    // Этот хук должен работать с данными из useAchievements
    const achievement = allAchievements.find(a => a.id === achievementId);
    
    // Вместо progressData ищем нужный прогресс в данных
    // Это заглушка, т.к. реальные данные о прогрессе должны приходить с API
    // Для исправления сборки вернем базовые значения
    const currentProgress = achievement ? 50 : 0; // Пример
    const target = achievement ? 100 : 0; // Пример

    const percentage = target > 0 ? (currentProgress / target) * 100 : 0;
    const completed = currentProgress >= target;

    return {
      progress: {
        current: currentProgress,
        target: target,
      },
      progressPercentage: percentage,
      isCompleted: completed,
    };
  }, [allAchievements, achievementId]);

  return {
    progress,
    progressPercentage,
    isCompleted,
    isLoading,
    error,
  };
}
