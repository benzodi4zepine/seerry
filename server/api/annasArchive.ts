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

      return books.map((book: any) => ({
        id: `aa-${book.md5}`,
        title: book.title || 'Unknown Title',
        authors: book.author ? [book.author] : [],
        summary: book.genre || '',
        coverUrl: book.imgUrl || '',
        downloadLinks: book.format
          ? [
              {
                format: book.format.toUpperCase(),
                url: `https://annas-archive.org/md5/${book.md5}`,
              },
            ]
          : [],
        publisher: '',
        published: book.year?.toString() || '',
        language: '',
      }));
    } catch (e) {
      console.error('Failed to search Annas Archive:', e);
      return [];
    }
  }

  public async getPopular(): Promise<CalibreBook[]> {
    // Fetch popular books by searching for common terms
    const popularSearches = ['fiction', 'fantasy', 'science', 'history', 'programming'];
    const randomSearch = popularSearches[Math.floor(Math.random() * popularSearches.length)];

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: randomSearch,
          page: 1,
          sort: 'mostRelevant',
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'annas-archive-api.p.rapidapi.com',
        },
      });

      const books = response.data?.books || [];

      return books.slice(0, 20).map((book: any) => ({
        id: `aa-${book.md5}`,
        title: book.title || 'Unknown Title',
        authors: book.author ? [book.author] : [],
        summary: book.genre || '',
        coverUrl: book.imgUrl || '',
        downloadLinks: book.format
          ? [
              {
                format: book.format.toUpperCase(),
                url: `https://annas-archive.org/md5/${book.md5}`,
              },
            ]
          : [],
        publisher: '',
        published: book.year?.toString() || '',
        language: '',
      }));
    } catch (e) {
      console.error('Failed to get popular books from Annas Archive:', e);
      return [];
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
