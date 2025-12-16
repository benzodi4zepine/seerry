import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export interface CalibreBook {
  id: string;
  title: string;
  authors: string[];
  summary?: string;
  coverUrl?: string;
  downloadLinks?: {
    format: string;
    url: string;
  }[];
  publisher?: string;
  published?: string;
  language?: string;
}

export default class CalibreWeb {
  private baseUrl: string;
  private username?: string;
  private password?: string;

  constructor(opts: { baseUrl: string; username?: string; password?: string }) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.username = opts.username;
    this.password = opts.password;
  }

  private async fetchBooks(url: string): Promise<CalibreBook[]> {
    const response = await axios.get(url, {
      auth:
        this.username && this.password
          ? { username: this.username, password: this.password }
          : undefined,
      headers: {
        Accept: 'application/atom+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const parsed = await parseStringPromise(response.data, {
      explicitArray: false,
      mergeAttrs: true,
    });

    const entries = parsed?.feed?.entry;

    if (!entries) {
      return [];
    }

    const normalizedEntries = Array.isArray(entries) ? entries : [entries];

    return normalizedEntries.map((entry) => {
      const links = Array.isArray(entry.link) ? entry.link : [entry.link];

      // Find cover image
      const imageLink = links?.find(
        (l: Record<string, string>) =>
          l?.rel === 'http://opds-spec.org/image' ||
          l?.type?.startsWith('image/')
      );

      // Convert relative cover URLs to absolute URLs
      let coverUrl = imageLink?.href;
      if (coverUrl && !coverUrl.startsWith('http')) {
        coverUrl = `${this.baseUrl}${coverUrl.startsWith('/') ? '' : '/'}${coverUrl}`;
      }

      // Extract download links
      const downloadLinks = links
        ?.filter(
          (l: Record<string, string>) =>
            l?.rel === 'http://opds-spec.org/acquisition' ||
            l?.type?.includes('epub') ||
            l?.type?.includes('pdf') ||
            l?.type?.includes('mobi') ||
            l?.type?.includes('azw')
        )
        .map((l: Record<string, string>) => {
          let url = l.href;
          if (url && !url.startsWith('http')) {
            url = `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
          }

          // Determine format from type or URL
          let format = 'EPUB';
          if (l.type?.includes('pdf')) format = 'PDF';
          else if (l.type?.includes('mobi')) format = 'MOBI';
          else if (l.type?.includes('azw')) format = 'AZW3';
          else if (url?.includes('.pdf')) format = 'PDF';
          else if (url?.includes('.mobi')) format = 'MOBI';
          else if (url?.includes('.azw')) format = 'AZW3';

          return { format, url };
        }) || [];

      return {
        id: entry.id,
        title: entry.title,
        authors: entry.author
          ? Array.isArray(entry.author)
            ? entry.author
                .map((a: { name?: string }) => a?.name)
                .filter(Boolean)
            : [entry.author?.name].filter(Boolean)
          : [],
        summary: entry.summary,
        coverUrl,
        downloadLinks,
        publisher: entry.publisher?.name,
        published: entry.published,
        language: entry['dcterms:language'] || entry.language,
      };
    });
  }

  public async getRecent(): Promise<CalibreBook[]> {
    const url = `${this.baseUrl}/opds/new`;
    return this.fetchBooks(url);
  }

  public async search(query: string): Promise<CalibreBook[]> {
    const url = `${this.baseUrl}/opds/search?q=${encodeURIComponent(query)}`;
    return this.fetchBooks(url);
  }
}
