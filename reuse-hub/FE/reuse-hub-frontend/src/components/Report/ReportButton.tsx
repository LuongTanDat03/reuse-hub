import React, { useState } from 'react';
import { ReportModal } from './ReportModal';
import { ReportedEntityType } from '../../types/report';

interface ReportButtonProps {
  entityType: ReportedEntityType;
  entityId: string;
  reportedUserId?: string;
  entityTitle?: string;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  entityType,
  entityId,
  reportedUserId,
  entityTitle,
  className = '',
  variant = 'icon',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderButton = () => {
    switch (variant) {
      case 'text':
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`text-sm text-gray-500 hover:text-red-600 transition-colors ${className}`}
          >
            Báo cáo
          </button>
        );
      case 'full':
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors ${className}`}
          >
            🚨 Báo cáo vi phạm
          </button>
        );
      default:
        return (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ${className}`}
            title="Báo cáo"
          >
            🚩
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        reportedUserId={reportedUserId}
        entityTitle={entityTitle}
      />
    </>
  );
};

export default ReportButton;
