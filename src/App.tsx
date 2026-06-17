
import { Header } from '@/components/Header';
import { EmployeeView } from '@/pages/EmployeeView';
import { ManagerView } from '@/pages/ManagerView';
import { useLeaveStore } from '@/store/leaveStore';

export default function App() {
  const { currentRole } = useLeaveStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <Header />
      <main className="animate-fadeIn">
        {currentRole === 'employee' ? <EmployeeView /> : <ManagerView />}
      </main>
    </div>
  );
}
