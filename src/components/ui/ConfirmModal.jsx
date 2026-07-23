import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import useUiStore from '../../store/uiStore';
import { useTranslation } from 'react-i18next';

const ConfirmModal = () => {
  const { t } = useTranslation();
  const { confirmModal, closeConfirm } = useUiStore();

  if (!confirmModal) return null;

  const { title, message, onConfirm, variant = 'danger' } = confirmModal;

  const handleConfirm = () => {
    onConfirm?.();
    closeConfirm();
  };

  const Icon = variant === 'danger' ? AlertTriangle : Info;
  const iconColor = variant === 'danger'
    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
    : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';

  return (
    <Modal
      open={true}
      onClose={closeConfirm}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={closeConfirm}>
            {t('common.cancel')}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {t('common.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-full shrink-0 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 pt-1">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
