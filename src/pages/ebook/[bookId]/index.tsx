import EbookDetail from '@app/components/Ebooks/EbookDetail';
import type { CalibreBook } from '@server/api/calibreWeb';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const EbookPage = () => {
  const router = useRouter();
  const { bookId } = router.query;
  const [book, setBook] = useState<CalibreBook | null>(null);

  useEffect(() => {
    // Try to get book data from localStorage
    if (bookId) {
      const storedBook = localStorage.getItem(`ebook_${bookId}`);
      if (storedBook) {
        setBook(JSON.parse(storedBook));
      } else {
        // If no book data found, redirect back to ebooks page
        router.push('/discover/ebooks');
      }
    }
  }, [bookId, router]);

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500"></div>
          <p className="text-gray-400">Loading book details...</p>
        </div>
      </div>
    );
  }

  return <EbookDetail book={book} />;
};

export default EbookPage;
