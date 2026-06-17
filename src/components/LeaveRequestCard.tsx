
import { Calendar, Clock, FileText, User as UserIcon } from 'lucide-react';
import { LeaveRequest, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '@/types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20',
};

const typeStyles: Record<string, string> = {
  annual: 'bg-blue-50 text-blue-700 border-blue-200',
  personal: 'bg-purple-50 text-purple-700 border-purple-200',
  sick: 'bg-teal-50 text-teal-700 border-teal-200',
};

interface LeaveRequestCardProps {
  request: LeaveRequest;
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCreatedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-xl">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{request.employeeName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatCreatedAt(request.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyles[request.status]}`}
        >
          {LEAVE_STATUS_LABELS[request.status]}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {formatDate(request.startDate)}
              {request.startDate !== request.endDate && (
                <span className="mx-2 text-gray-400">至</span>
              )}
              {request.startDate !== request.endDate && formatDate(request.endDate)}
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
            {request.days} 天
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${typeStyles[request.type]}`}
          >
            {LEAVE_TYPE_LABELS[request.type]}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">{request.reason}</p>
        </div>
      </div>
    </div>
  );
}
