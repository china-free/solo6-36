
import { useState } from 'react';
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLeaveStore } from '@/store/leaveStore';
import { LeaveType, LEAVE_TYPE_LABELS } from '@/types';
import { LeaveRequestCard } from '@/components/LeaveRequestCard';

function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export function EmployeeView() {
  const {
    currentEmployeeId,
    getCurrentEmployee,
    getRequestsByEmployee,
    getUsedAnnualDays,
    getRemainingAnnualDays,
    submitRequest,
  } = useLeaveStore();

  const employee = getCurrentEmployee();
  const myRequests = getRequestsByEmployee(currentEmployeeId);
  const usedAnnual = getUsedAnnualDays(currentEmployeeId);
  const remainingAnnual = getRemainingAnnualDays(currentEmployeeId);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (value && endDate) {
      setDays(calculateDays(value, endDate));
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (startDate && value) {
      setDays(calculateDays(startDate, value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);

    if (!startDate || !endDate) {
      setError('请选择请假日期');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('结束日期不能早于开始日期');
      return;
    }
    if (!reason.trim()) {
      setError('请填写请假理由');
      return;
    }
    if (days <= 0) {
      setError('请假天数无效');
      return;
    }

    if (leaveType === 'annual' && days > remainingAnnual) {
      setError(`年假不足，剩余年假仅 ${remainingAnnual} 天`);
      return;
    }

    submitRequest({
      startDate,
      endDate,
      type: leaveType,
      days,
      reason: reason.trim(),
    });

    setStartDate('');
    setEndDate('');
    setLeaveType('annual');
    setDays(1);
    setReason('');
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const annualUsagePercent =
    employee && employee.annualLeaveTotal > 0
      ? Math.min(100, (usedAnnual / employee.annualLeaveTotal) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {employee && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-7 text-white shadow-xl shadow-blue-900/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-200" />
                  年假概览
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">剩余年假</p>
                    <p className="text-4xl font-bold tracking-tight">
                      {remainingAnnual}
                      <span className="text-lg font-normal text-blue-200 ml-1">
                        天
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-sm mb-1">总额度</p>
                    <p className="text-xl font-semibold">
                      {employee.annualLeaveTotal}
                      <span className="text-sm font-normal text-blue-200 ml-1">
                        天
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-200">已使用</span>
                    <span className="font-medium">
                      {usedAnnual} / {employee.annualLeaveTotal} 天
                    </span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full transition-all duration-500"
                      style={{ width: `${annualUsagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-7 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-blue-600" />
                  提交请假申请
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="p-7 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      开始日期
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    请假类型
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map(
                      (type) => (
                        <option key={type} value={type}>
                          {LEAVE_TYPE_LABELS[type]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    请假天数
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <span className="text-gray-500 font-medium">天</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    请假理由
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="请详细说明请假原因..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {showSuccess && (
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    申请提交成功，等待审批！
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  提交申请
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="px-7 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  我的申请记录
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  共 {myRequests.length} 条
                </span>
              </div>

              <div className="p-7">
                {myRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <FileText className="w-16 h-16 mb-4 text-gray-200" />
                    <p className="text-lg font-medium text-gray-500">暂无请假申请</p>
                    <p className="text-sm text-gray-400 mt-1">提交您的第一份请假申请吧</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                    {myRequests.map((request) => (
                      <LeaveRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
