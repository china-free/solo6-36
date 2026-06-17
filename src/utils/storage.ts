
const STORAGE_KEYS = {
  employees: 'leave_employees',
  requests: 'leave_requests',
  currentEmployeeId: 'leave_current_employee_id',
  currentRole: 'leave_current_role',
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.error('Error reading from localStorage', e);
  }
  return defaultValue;
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
}

export { STORAGE_KEYS };
