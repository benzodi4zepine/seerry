import { Transition } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  HeartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { DeviceTabletIcon } from '@heroicons/react/24/solid';
import type { CalibreBook } from '@server/api/calibreWeb';
import { useState } from 'react';

interface BookDetailModalProps {
  book: CalibreBook | null;
  onClose: () => void;
}

const BookDetailModal = ({ book, onClose }: BookDetailModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!book?.id) return;

    setIsDownloading(true);
    try {
      // Extract MD5 from book ID (format: aa-{md5})
      const md5 = book.id.replace('aa-', '');

      // Fetch the actual download link from the server
      const response = await fetch(`/api/v1/discover/ebooks/download/${md5}`);
      const data = await response.json();

      if (data.downloadLink) {
        // Create a temporary link and click it to trigger download
        const link = document.createElement('a');
        link.href = data.downloadLink;
        link.download = `${book.title}.epub`; // You can adjust the extension based on format
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Download link not available');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the book');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendToKindle = () => {
    alert('Send to Kindle coming soon!');
  };

  const handleSendToKobo = () => {
    alert('Send to Kobo coming soon!');
  };

  const handleReadOnline = () => {
    if (book?.downloadLinks && book.downloadLinks.length > 0) {
      window.open(book.downloadLinks[0].url, '_blank');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Transition
      show={!!book}
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-80 transition-opacity"
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose();
              }
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close modal"
          />
        </Transition.Child>

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:h-screen sm:align-middle"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {book && (
          <div className="animate-in fade-in zoom-in relative inline-block w-full max-w-6xl transform overflow-hidden rounded-lg bg-gray-900 text-left align-bottom shadow-xl transition-all duration-300 sm:my-8 sm:align-middle">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Left side - Book cover and main info */}
              <div className="flex-1 bg-gradient-to-br from-gray-900 to-black p-8">
                <div className="flex flex-col items-start gap-6 md:flex-row">
                  {/* Book cover */}
                  <div className="flex-shrink-0">
                    {book?.coverUrl ? (
                      <img
                        src={book?.coverUrl}
                        alt={book?.title}
                        className="h-auto w-64 rounded-lg shadow-2xl ring-1 ring-gray-700"
                      />
                    ) : (
                      <div className="flex h-96 w-64 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl ring-1 ring-gray-700">
                        <BookOpenIcon className="h-24 w-24 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Book info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white lg:text-4xl">
                      {book?.title}
                    </h1>

                    {book?.authors && book.authors.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-400">by</span>
                        <span className="text-xl text-gray-200">
                          {book.authors.join(', ')}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {book?.published && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Year:</span>
                          <span className="text-white">
                            {book?.published.includes('-')
                              ? new Date(book.published).getFullYear()
                              : book.published}
                          </span>
                        </div>
                      )}
                      {book?.language && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Language:</span>
                          <span className="text-white">
                            {book?.language.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {book?.summary && (
                      <div className="mt-6">
                        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
                          <BookOpenIcon className="h-5 w-5" />
                          Description
                        </h2>
                        <div
                          className="max-h-64 overflow-y-auto text-sm leading-relaxed text-gray-300"
                          dangerouslySetInnerHTML={{
                            __html: book?.summary || '',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar - Details and actions */}
              <div className="w-full border-t border-gray-700 bg-gray-900 lg:w-96 lg:border-l lg:border-t-0">
                {/* Action buttons */}
                <div className="space-y-2 border-b border-gray-700 p-4">
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                      isFavorite
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <HeartIcon
                      className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`}
                    />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>

                  {book?.downloadLinks && book.downloadLinks.length > 0 && (
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </button>
                  )}

                  <button
                    onClick={handleSendToKobo}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                  >
                    <DeviceTabletIcon className="h-5 w-5" />
                    Send to Kobo
                  </button>

                  <button
                    onClick={handleSendToKindle}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                  >
                    <DeviceTabletIcon className="h-5 w-5" />
                    Send to Kindle
                  </button>

                  <button
                    onClick={handleReadOnline}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    Read Online
                  </button>
                </div>

                {/* Details section */}
                <div className="p-4">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    Details
                  </h3>

                  <div className="space-y-4 text-sm">
                    {book?.authors && book.authors.length > 0 && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Author(s)
                        </div>
                        <div className="text-white">
                          {book.authors.join(', ')}
                        </div>
                      </div>
                    )}

                    {book?.publisher && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Publisher
                        </div>
                        <div className="text-white">{book?.publisher}</div>
                      </div>
                    )}

                    {book?.published && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Published
                        </div>
                        <div className="text-white">
                          {book?.published.includes('-')
                            ? new Date(book.published).getFullYear()
                            : book.published}
                        </div>
                      </div>
                    )}

                    {book?.language && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                          Language
                        </div>
                        <div className="text-white">
                          {book?.language.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {book?.id && (
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-gray-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                          ISBN
                        </div>
                        <div className="text-white">N/A</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Transition>
  );
};

export default BookDetailModal;
