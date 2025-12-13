import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export interface CalibreBook {
  id: string;
  title: string;
  authors: string[];
  summary?: string;
  coverUrl?: string;
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

  public async search(query: string): Promise<CalibreBook[]> {
    const url = `${this.baseUrl}/opds/v1.2/search?q=${encodeURIComponent(
      query
    )}`;

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
      const imageLink = links?.find(
        (l: Record<string, string>) =>
          l?.rel === 'http://opds-spec.org/image' ||
          l?.type?.startsWith('image/')
      );

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
        coverUrl: imageLink?.href,
      };
    });
  }
}
