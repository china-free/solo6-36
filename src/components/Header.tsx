
import { CalendarDays, User, Users } from 'lucide-react';
import { useLeaveStore } from '@/store/leaveStore';
import { ROLE_LABELS, Role } from '@/types';

export function Header() {
  const {
    currentRole,
    currentEmployeeId,
    employees,
    setCurrentRole,
    setCurrentEmployeeId,
  } = useLeaveStore();

  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
              <CalendarDays className="w-8 h-8 text-blue-100" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                请假管理系统
              </h1>
              <p className="text-blue-200 text-sm">Leave Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentRole === 'employee' && (
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
                <User className="w-5 h-5 text-blue-200" />
                <select
                  value={currentEmployeeId}
                  onChange={(e) => setCurrentEmployeeId(e.target.value)}
                  className="bg-transparent text-white font-medium border-none outline-none cursor-pointer focus:ring-0"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="text-gray-900">
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm">
              <Users className="w-5 h-5 text-blue-800" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as Role)}
                className="bg-transparent text-blue-900 font-semibold border-none outline-none cursor-pointer focus:ring-0"
              >
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
