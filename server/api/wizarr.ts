import axios from 'axios';

export interface WizarrUser {
  id: number;
  username: string;
  email?: string;
  server?: string;
  serverType?: string;
  expires?: string | null;
  created?: string | null;
}

export interface WizarrUsersResponse {
  users: WizarrUser[];
  count?: number;
}

export default class WizarrClient {
  private baseUrl: string;
  private token: string;

  constructor(opts: { baseUrl: string; token: string }) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.token = opts.token;
  }

  private headerAttempts(): Record<string, string>[] {
    const token = this.token;
    return [
      { 'x-api-key': token },
      { Authorization: `Bearer ${token}` },
      { Authorization: `Token ${token}` },
      { Authorization: token },
    ];
  }

  public async getUsers(): Promise<WizarrUser[]> {
    const attempts = this.headerAttempts();
    let lastError: unknown;

    for (const headers of attempts) {
      try {
        const response = await axios.get<WizarrUsersResponse>(
          `${this.baseUrl}/api/users`,
          {
            headers,
          }
        );

        if (Array.isArray(response.data.users)) {
          return response.data.users;
        }

        return [];
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError ?? new Error('Unable to fetch Wizarr users');
  }
}
