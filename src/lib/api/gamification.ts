import { getApiBaseUrl } from '../utils/env';

const API_BASE_URL = getApiBaseUrl();

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function getGamificationData() {
  const [levelRes, tasksRes, achievementsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/gamification/level`, { headers: getAuthHeaders() }),
    fetch(`${API_BASE_URL}/gamification/daily-tasks`, { headers: getAuthHeaders() }),
    fetch(`${API_BASE_URL}/gamification/achievements`, { headers: getAuthHeaders() })
  ]);

  const [levelData, tasksData, achievementsData] = await Promise.all([
    levelRes.json(),
    tasksRes.json(),
    achievementsRes.json()
  ]);

  return {
    level: levelData.success ? levelData : null,
    dailyTasks: tasksData.success ? tasksData.tasks : [],
    achievements: achievementsData.success ? achievementsData.achievements : []
  };
}

export async function getUserStats() {
  const response = await fetch(`${API_BASE_URL}/user/stats`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  return data.success ? data.stats : null;
}

export async function claimDailyTask(taskId: string) {
  const response = await fetch(`${API_BASE_URL}/gamification/daily-tasks/${taskId}/claim`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}
