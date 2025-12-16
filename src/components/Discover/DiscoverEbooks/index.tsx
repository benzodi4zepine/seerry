import Button from '@app/components/Common/Button';
import Header from '@app/components/Common/Header';
import PageTitle from '@app/components/Common/PageTitle';
import defineMessages from '@app/utils/defineMessages';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import type { CalibreBook } from '@server/api/calibreWeb';
import axios from 'axios';
import { useState } from 'react';
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

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.get('/api/v1/discover/ebooks', {
        params: { q: searchQuery },
      });
      setBooks(response.data.results || []);
    } catch (error) {
      console.error('Failed to search ebooks:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-all hover:border-gray-500 hover:shadow-lg"
            >
              {book.coverUrl && (
                <div className="aspect-[2/3] w-full overflow-hidden bg-gray-900">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                  {book.title}
                </h3>
                {book.authors && book.authors.length > 0 && (
                  <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                    {book.authors.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DiscoverEbooks;
