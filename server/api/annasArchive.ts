import type { CalibreBook } from '@server/api/calibreWeb';
import axios from 'axios';

export default class AnnasArchive {
  private apiKey: string;
  private baseUrl = 'https://annas-archive-api.p.rapidapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async search(query: string): Promise<CalibreBook[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          page: 1,
          sort: 'mostRelevant',
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'annas-archive-api.p.rapidapi.com',
        },
      });

      const books = response.data?.books || [];

      // Debug: Log the first book to see available fields
      if (books.length > 0) {
        console.log(
          'Sample book data from API:',
          JSON.stringify(books[0], null, 2)
        );
      }

      return books.map((book: any) => ({
        id: `aa-${book.md5}`,
        title: book.title || 'Unknown Title',
        authors: book.author ? [book.author] : [],
        summary: book.description || book.synopsis || book.summary || '',
        coverUrl: book.imgUrl || '',
        downloadLinks: book.format
          ? [
              {
                format: book.format.toUpperCase(),
                url: `https://annas-archive.org/md5/${book.md5}`,
              },
            ]
          : [],
        publisher: book.publisher || '',
        published: book.year?.toString() || '',
        language: book.language || '',
      }));
    } catch (e) {
      console.error('Failed to search Annas Archive:', e);
      return [];
    }
  }

  public async getPopular(): Promise<CalibreBook[]> {
    // Fetch popular books by searching for multiple terms and combining results
    const popularSearches = [
      'fiction',
      'fantasy',
      'science',
      'history',
      'programming',
    ];
    const allBooks: CalibreBook[] = [];
    const seenMd5s = new Set<string>();

    try {
      // Fetch from multiple search terms to get variety
      for (const searchTerm of popularSearches.slice(0, 3)) {
        const response = await axios.get(`${this.baseUrl}/search`, {
          params: {
            q: searchTerm,
            page: 1,
            sort: 'mostRelevant',
          },
          headers: {
            'x-rapidapi-key': this.apiKey,
            'x-rapidapi-host': 'annas-archive-api.p.rapidapi.com',
          },
        });

        const books = response.data?.books || [];

        // Add unique books only
        for (const book of books) {
          if (!seenMd5s.has(book.md5)) {
            seenMd5s.add(book.md5);
            allBooks.push({
              id: `aa-${book.md5}`,
              title: book.title || 'Unknown Title',
              authors: book.author ? [book.author] : [],
              summary: book.description || book.synopsis || book.summary || '',
              coverUrl: book.imgUrl || '',
              downloadLinks: book.format
                ? [
                    {
                      format: book.format.toUpperCase(),
                      url: `https://annas-archive.org/md5/${book.md5}`,
                    },
                  ]
                : [],
              publisher: book.publisher || '',
              published: book.year?.toString() || '',
              language: book.language || '',
            });
          }

          // Limit to 30 unique books total
          if (allBooks.length >= 30) {
            return allBooks;
          }
        }
      }

      return allBooks;
    } catch (e) {
      console.error('Failed to get popular books from Annas Archive:', e);
      return [];
    }
  }

  public async getDownloadLink(md5: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/download/${md5}`, {
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'annas-archive-api.p.rapidapi.com',
        },
      });

      // The API should return download links
      if (response.data?.downloadLink) {
        return response.data.downloadLink;
      }

      // Fallback to direct link if available
      if (response.data?.url) {
        return response.data.url;
      }

      return null;
    } catch (e) {
      console.error('Failed to get download link from Annas Archive:', e);
      return null;
    }
  }

  private guessFormat(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('.pdf')) return 'PDF';
    if (lower.includes('.epub')) return 'EPUB';
    if (lower.includes('.mobi')) return 'MOBI';
    if (lower.includes('.azw')) return 'AZW3';
    return 'EPUB';
  }
}
