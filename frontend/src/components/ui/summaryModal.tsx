
import { ReviewSummaryData } from '@/types/review';
import { CloseOutlined } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: ReviewSummaryData | null;
}

export function SummaryModal({ isOpen, onClose, isLoading, data } : SummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className='w-96 max-w-md p-6 bg-white rounded-xl shadow-2xl border border-gray-200 absolute top-4 right-4 z-50'>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-dark-text">
            {data?.location || 'Summary'}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition text-gray-500"
        >
          <CloseOutlined fontSize="small" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <CircularProgress size={30} />
        </div>
      ) : data ? (
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {/* Summary Section */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {data.summaryEN}
            </p>
          </div>

          {/* Sources Section */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources</p>
            <ul className="space-y-2">
              {data.sources.map((source, index) => (
                <li key={index}>
                  <a 
                    href={source.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block truncate"
                  >
                    • {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No summary available.</p>
      )}
    </div>
  );
}