import Button from '@app/components/Common/Button';
import Modal from '@app/components/Common/Modal';
import { ArrowDownTrayIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { CalibreBook } from '@server/api/calibreWeb';

interface BookDetailModalProps {
  book: CalibreBook | null;
  onClose: () => void;
}

const BookDetailModal = ({ book, onClose }: BookDetailModalProps) => {
  if (!book) return null;

  const handleDownload = (url: string, format: string) => {
    window.open(url, '_blank');
  };

  const handleSendToKindle = () => {
    // TODO: Implement send to kindle
    alert('Send to Kindle coming soon!');
  };

  return (
    <Modal
      onCancel={onClose}
      title=""
      cancelText="Close"
      okText=""
      onOk={() => {}}
    >
      <div className="flex flex-col space-y-6">
        {/* Header with title */}
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white">{book.title}</h2>
          {book.authors && book.authors.length > 0 && (
            <p className="mt-2 text-lg text-gray-300">
              by {book.authors.join(', ')}
            </p>
          )}
        </div>

        {/* Main content area */}
        <div className="flex gap-6">
          {/* Book cover */}
          <div className="flex-shrink-0">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-52 rounded-lg shadow-2xl ring-1 ring-gray-700"
              />
            ) : (
              <div className="flex h-80 w-52 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl ring-1 ring-gray-700">
                <svg className="h-20 w-20 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>

          {/* Book details */}
          <div className="flex-1 space-y-6">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-4">
              {book.published && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Published
                  </h3>
                  <p className="mt-1 text-white">
                    {book.published.includes('-')
                      ? new Date(book.published).getFullYear()
                      : book.published}
                  </p>
                </div>
              )}
              {book.language && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Language
                  </h3>
                  <p className="mt-1 text-white">{book.language.toUpperCase()}</p>
                </div>
              )}
              {book.publisher && (
                <div className="col-span-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Publisher
                  </h3>
                  <p className="mt-1 text-white">{book.publisher}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {book.summary && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Description
                </h3>
                <div
                  className="mt-2 max-h-40 overflow-y-auto text-sm leading-relaxed text-gray-300"
                  dangerouslySetInnerHTML={{ __html: book.summary }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 border-t border-gray-700 pt-6">
          {book.downloadLinks && book.downloadLinks.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Download Options
              </h3>
              <div className="flex flex-wrap gap-2">
                {book.downloadLinks.map((link, index) => (
                  <Button
                    key={index}
                    onClick={() => handleDownload(link.url, link.format)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>{link.format}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSendToKindle}
              className="flex flex-1 items-center justify-center gap-2 bg-green-600 hover:bg-green-500"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              <span>Send to Kindle</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookDetailModal;
