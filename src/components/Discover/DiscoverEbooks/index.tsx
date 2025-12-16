import Button from '@app/components/Common/Button';
import Header from '@app/components/Common/Header';
import PageTitle from '@app/components/Common/PageTitle';
import BookDetailModal from '@app/components/Ebooks/BookDetailModal';
import defineMessages from '@app/utils/defineMessages';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import type { CalibreBook } from '@server/api/calibreWeb';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const messages = defineMessages('components.Discover.DiscoverEbooks', {
  discoverebooks: 'Ebooks',
  searchPlaceholder: 'Search for books...',
  search: 'Search',
  noResults: 'No books found',
  searchPrompt: 'Enter a search query to discover books',
});

const DiscoverEbooks = () => {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<CalibreBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBook, setSelectedBook] = useState<CalibreBook | null>(null);

  const fetchBooks = async (query = '') => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get('/api/v1/discover/ebooks', {
        params: query ? { q: query } : {},
      });
      setBooks(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch ebooks:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await fetchBooks(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const title = intl.formatMessage(messages.discoverebooks);

  return (
    <>
      <PageTitle title={title} />
      <div className="mb-4">
        <Header>{title}</Header>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            className="flex-1 rounded-md border border-gray-500 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>{intl.formatMessage(messages.search)}</span>
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
        </div>
      )}

      {!isLoading && !hasSearched && (
        <div className="flex justify-center py-12 text-gray-400">
          {intl.formatMessage(messages.searchPrompt)}
        </div>
      )}

      {!isLoading && hasSearched && books.length === 0 && (
        <div className="flex justify-center py-12 text-gray-400">
          {intl.formatMessage(messages.noResults)}
        </div>
      )}

      {!isLoading && books.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="group relative cursor-pointer transition-all duration-300"
            >
              <div className="overflow-hidden rounded-lg bg-gray-800 shadow-xl ring-1 ring-gray-700 transition-all group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-indigo-500">
                {book.coverUrl ? (
                  <div className="aspect-[2/3] w-full overflow-hidden bg-gray-900">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[2/3] w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center p-4">
                      <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">{book.title}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-12 opacity-0 transition-opacity group-hover:opacity-100">
                  <h3 className="text-sm font-bold text-white line-clamp-2 drop-shadow-lg">
                    {book.title}
                  </h3>
                  {book.authors && book.authors.length > 0 && (
                    <p className="mt-1 text-xs text-gray-300 line-clamp-1 drop-shadow">
                      {book.authors.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </>
  );
};

export default DiscoverEbooks;
