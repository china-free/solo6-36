
import { Calendar, Clock, FileText, User as UserIcon } from 'lucide-react';
import { LeaveRequest, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '@/types';
import {
  formatDate,
  formatDateTime,
  STATUS_TAG_STYLES,
  TYPE_STYLES,
} from '@/utils/formatters';

interface LeaveRequestCardProps {
  request: LeaveRequest;
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-xl">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {request.employeeName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDateTime(request.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_TAG_STYLES[request.status]}`}
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
              {request.startDate !== request.endDate &&
                formatDate(request.endDate)}
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
            {request.days} 天
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${TYPE_STYLES[request.type]}`}
          >
            {LEAVE_TYPE_LABELS[request.type]}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {request.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
