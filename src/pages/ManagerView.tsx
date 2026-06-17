
import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  User as UserIcon,
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useLeaveStore } from '@/store/leaveStore';
import {
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
  LeaveRequest,
} from '@/types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

const typeStyles: Record<string, string> = {
  annual: 'bg-blue-50 text-blue-700 border-blue-200',
  personal: 'bg-purple-50 text-purple-700 border-purple-200',
  sick: 'bg-teal-50 text-teal-700 border-teal-200',
};

type TabType = 'pending' | 'stats';

interface ToastMessage {
  id: number;
  type: 'error' | 'success' | 'warning';
  text: string;
}

export function ManagerView() {
  const {
    employees,
    getPendingRequests,
    getAllRequests,
    updateRequestStatus,
    getUsedAnnualDays,
    getRemainingAnnualDays,
    canApproveAnnualRequest,
  } = useLeaveStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pendingRequests = getPendingRequests();
  const allRequests = getAllRequests();

  const showToast = (type: ToastMessage['type'], text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleApprove = (id: string) => {
    const result = updateRequestStatus(id, 'approved');
    if (result.success) {
      showToast('success', '申请已通过');
    } else {
      showToast('error', result.reason || '审批失败');
    }
  };

  const handleReject = (id: string) => {
    updateRequestStatus(id, 'rejected');
    showToast('warning', '申请已拒绝');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const stats = {
    totalEmployees: employees.length,
    totalRequests: allRequests.length,
    pendingCount: pendingRequests.length,
    approvedCount: allRequests.filter((r) => r.status === 'approved').length,
  };

  const toastColorMap = {
    error: 'bg-rose-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="fixed top-24 right-8 z-50 space-y-3 w-[420px] max-w-[92vw]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${toastColorMap[toast.type]} text-white px-5 py-4 rounded-2xl shadow-2xl shadow-black/15 flex items-start gap-3 animate-fadeIn`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed flex-1 whitespace-pre-line">
              {toast.text}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-6 h-6 text-blue-100" />
          </div>
          <p className="text-blue-100 text-sm mb-1">员工总数</p>
          <p className="text-3xl font-bold">{stats.totalEmployees}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-6 h-6 text-amber-100" />
          </div>
          <p className="text-amber-100 text-sm mb-1">待审批</p>
          <p className="text-3xl font-bold">{stats.pendingCount}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-100" />
          </div>
          <p className="text-emerald-100 text-sm mb-1">已通过</p>
          <p className="text-3xl font-bold">{stats.approvedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 text-violet-100" />
          </div>
          <p className="text-violet-100 text-sm mb-1">总申请数</p>
          <p className="text-3xl font-bold">{stats.totalRequests}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-7 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              待审批申请
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'stats'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              年假统计
            </button>
          </div>
        </div>

        <div className="p-7">
          {activeTab === 'pending' && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <CheckCircle2 className="w-20 h-20 mb-5 text-emerald-200" />
                  <p className="text-xl font-semibold text-gray-500">
                    太棒了！暂无待审批申请
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    所有请假申请都已处理完毕
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                          申请人
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                          日期范围
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                          类型
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                          天数
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                          理由
                        </th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-600 text-sm">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pendingRequests.map((request) => (
                        <PendingRow
                          key={request.id}
                          request={request}
                          formatDate={formatDate}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          canApproveResult={
                            request.type === 'annual'
                              ? canApproveAnnualRequest(request.id)
                              : { success: true }
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                        员工姓名
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                        年假总额
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                        已休天数
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">
                        剩余天数
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm w-80">
                        使用进度
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {employees.map((emp) => {
                      const used = getUsedAnnualDays(emp.id);
                      const remaining = getRemainingAnnualDays(emp.id);
                      const percent =
                        emp.annualLeaveTotal > 0
                          ? Math.min(
                              100,
                              (used / emp.annualLeaveTotal) * 100
                            )
                          : 0;

                      const progressColor =
                        percent >= 90
                          ? 'from-rose-500 to-red-500'
                          : percent >= 70
                          ? 'from-amber-500 to-orange-500'
                          : 'from-emerald-500 to-teal-500';

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                {emp.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-900">
                                {emp.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="text-gray-700 font-medium">
                              {emp.annualLeaveTotal} 天
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <span className="text-blue-700 font-semibold">
                              {used} 天
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <span
                              className={`font-bold ${
                                remaining <= 3
                                  ? 'text-rose-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {remaining} 天
                            </span>
                          </td>
                          <td className="py-5 px-4">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">
                                  {percent.toFixed(0)}%
                                </span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type ApproveResult = {
  success: boolean;
  reason?: string;
};

interface PendingRowProps {
  request: LeaveRequest;
  formatDate: (date: string) => string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  canApproveResult: ApproveResult;
}

function PendingRow({
  request,
  formatDate,
  onApprove,
  onReject,
  canApproveResult,
}: PendingRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isBlocked = !canApproveResult.success;

  return (
    <>
      <tr
        className={`transition-colors ${
          isBlocked
            ? 'bg-rose-50/40 hover:bg-rose-50/60'
            : 'hover:bg-blue-50/30'
        }`}
      >
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow">
              {request.employeeName.charAt(0)}
            </div>
            <span className="font-semibold text-gray-900">
              {request.employeeName}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm">
              {formatDate(request.startDate)}
              {request.startDate !== request.endDate && (
                <>
                  <span className="mx-1 text-gray-400">~</span>
                  {formatDate(request.endDate)}
                </>
              )}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${typeStyles[request.type]}`}
          >
            {LEAVE_TYPE_LABELS[request.type]}
          </span>
        </td>
        <td className="py-4 px-4">
          <span className="font-bold text-blue-700 text-lg">{request.days}</span>
          <span className="text-gray-500 text-sm ml-1">天</span>
        </td>
        <td className="py-4 px-4 max-w-xs">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">{request.reason}</p>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex flex-col items-end gap-2">
            {isBlocked && (
              <div
                className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 max-w-[260px]"
                title={canApproveResult.reason}
              >
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-rose-500" />
                <span className="leading-snug">{canApproveResult.reason}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="查看详情"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl transition-all border border-rose-200 hover:border-rose-300"
              >
                <XCircle className="w-4 h-4" />
                拒绝
              </button>
              <button
                onClick={() => onApprove(request.id)}
                disabled={isBlocked}
                className={`flex items-center gap-1.5 px-4 py-2 font-medium rounded-xl transition-all ${
                  isBlocked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/40'
                }`}
                title={isBlocked ? canApproveResult.reason : '通过申请'}
              >
                <CheckCircle2 className="w-4 h-4" />
                通过
              </button>
            </div>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr
          className={`bg-gradient-to-r ${
            isBlocked
              ? 'from-rose-50/60 to-orange-50/40'
              : 'from-blue-50/50 to-indigo-50/30'
          }`}
        >
          <td colSpan={6} className="py-5 px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <DetailItem
                icon={<UserIcon className="w-4 h-4 text-blue-500" />}
                label="申请人"
                value={request.employeeName}
              />
              <DetailItem
                icon={<Calendar className="w-4 h-4 text-blue-500" />}
                label="提交时间"
                value={formatDate(request.createdAt)}
              />
              <DetailItem
                icon={<Clock className="w-4 h-4 text-blue-500" />}
                label="请假天数"
                value={`${request.days} 天`}
              />
              <DetailItem
                icon={<FileText className="w-4 h-4 text-blue-500" />}
                label="当前状态"
                value={LEAVE_STATUS_LABELS[request.status]}
                valueClass={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyles[request.status]}`}
              />
            </div>
            <div className="mt-5 p-4 bg-white rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                请假理由
              </p>
              <p className="text-gray-800 leading-relaxed">{request.reason}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}

function DetailItem({ icon, label, value, valueClass }: DetailItemProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
        {icon}
        <span className="font-medium uppercase tracking-wider">{label}</span>
      </div>
      {valueClass ? (
        <span className={valueClass}>{value}</span>
      ) : (
        <p className="font-semibold text-gray-900">{value}</p>
      )}
    </div>
  );
}
