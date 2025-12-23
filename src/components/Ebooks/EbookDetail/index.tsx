import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { CalibreBook } from '@server/api/calibreWeb';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface EbookDetailProps {
  book: CalibreBook;
}

const EbookDetail = ({ book }: EbookDetailProps) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!book?.id) return;

    setIsDownloading(true);
    try {
      const md5 = book.id.replace('aa-', '');
      const response = await fetch(`/api/v1/discover/ebooks/download/${md5}`);
      const data = await response.json();

      if (data.downloadLink) {
        const link = document.createElement('a');
        link.href = data.downloadLink;
        link.download = `${book.title}.epub`;
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

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button */}
      <div className="border-b border-neutral-800 bg-black">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Books</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left column - Book cover and description */}
          <div className="lg:col-span-7">
            <div className="space-y-6">
              {/* Book cover and title */}
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Book cover */}
                <div className="flex-shrink-0">
                  {book?.coverUrl ? (
                    <img
                      src={book?.coverUrl}
                      alt={book?.title}
                      className="h-auto w-64 rounded-lg shadow-2xl"
                    />
                  ) : (
                    <div className="flex h-96 w-64 items-center justify-center rounded-lg bg-neutral-900">
                      <BookOpenIcon className="h-24 w-24 text-neutral-700" />
                    </div>
                  )}
                </div>

                {/* Title and metadata */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold text-white">
                      {book?.title}
                    </h1>
                    {book?.authors && book.authors.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-neutral-400" />
                        <span className="text-base text-neutral-400">
                          {book.authors.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick metadata */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {book?.published && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-neutral-400"
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
                        <span className="text-neutral-400">
                          {book?.published.includes('-')
                            ? new Date(book.published).getFullYear()
                            : book.published}
                        </span>
                      </div>
                    )}
                    {book?.language && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-neutral-400"
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
                        <span className="text-neutral-400">
                          {book?.language.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg bg-neutral-900 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <BookOpenIcon className="h-5 w-5" />
                  Description
                </h2>
                {book?.summary ? (
                  <div
                    className="prose prose-sm prose-invert max-w-none text-neutral-300 prose-headings:text-white prose-p:leading-relaxed prose-a:text-neutral-400 prose-strong:text-white"
                    dangerouslySetInnerHTML={{
                      __html: book?.summary || '',
                    }}
                  />
                ) : (
                  <p className="text-sm text-neutral-400">
                    No description available for this book.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Actions and details */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-lg bg-neutral-900 p-6">
                <button
                  onClick={handleToggleFavorite}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"
                >
                  {isFavorite ? (
                    <HeartIconSolid className="h-5 w-5" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>

                {book?.downloadLinks && book.downloadLinks.length > 0 && (
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                )}

                <button
                  onClick={handleSendToKobo}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  Send to Kobo
                </button>

                <button
                  onClick={handleSendToKindle}
                  className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Send to Kindle
                </button>

                <button
                  onClick={handleReadOnline}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  Read Online
                </button>
              </div>

              {/* Details */}
              <div className="rounded-lg bg-neutral-900 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Details
                </h3>

                <div className="space-y-4">
                  {book?.authors && book.authors.length > 0 && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400"
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
                      <div className="flex-1">
                        <div className="text-sm text-neutral-400">
                          Author(s)
                        </div>
                        <div className="mt-1 text-base text-white">
                          {book.authors.join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {book?.publisher && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400"
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
                      <div className="flex-1">
                        <div className="text-sm text-neutral-400">
                          Publisher
                        </div>
                        <div className="mt-1 text-base text-white">
                          {book?.publisher}
                        </div>
                      </div>
                    </div>
                  )}

                  {book?.published && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400"
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
                      <div className="flex-1">
                        <div className="text-sm text-neutral-400">
                          Published
                        </div>
                        <div className="mt-1 text-base text-white">
                          {book?.published.includes('-')
                            ? new Date(book.published).getFullYear()
                            : book.published}
                        </div>
                      </div>
                    </div>
                  )}

                  {book?.language && (
                    <div className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-400"
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
                      <div className="flex-1">
                        <div className="text-sm text-neutral-400">Language</div>
                        <div className="mt-1 text-base text-white">
                          {book?.language.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookDetail;
