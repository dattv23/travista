
import { CloseOutlined } from '@mui/icons-material';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SummaryModal({ isOpen, onClose } : SummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className='w-48 max-w-md p-4 bg-white rounded-lg shadow-lg border border-gray-200 absolute top-0 right-0'>
      <div className="flex justify-between items-start">
        <p className="paragraph-p1-semibold text-dark-text mb-4">Summary</p>
        <button 
          onClick={onClose}
          className="flex items-start transition cursor-pointer p-2 rounded-full hover:bg-hover"
        >
          <CloseOutlined />
        </button>
      </div>      
    </div>
  );
}