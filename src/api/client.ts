import { BaseAPI } from './base';
import { GeniusOptions, ApiResponse, TextFormat } from '../types';

export class PublicAPI extends BaseAPI {
  constructor(options: GeniusOptions = {}) {
    super(options);
  }

  // Search endpoints
  async searchAll(searchTerm: string): Promise<ApiResponse> {
    return this.apiRequest('/search', { q: searchTerm });
  }

  // Song endpoints
  async song(songId: number, textFormat?: TextFormat): Promise<ApiResponse> {
    const params = textFormat ? { text_format: textFormat } : {};
    return this.apiRequest(`/songs/${songId}`, params);
  }

  async referents(songId: number, textFormat?: TextFormat): Promise<ApiResponse> {
    const params = {
      song_id: songId,
      ...(textFormat && { text_format: textFormat })
    };
    return this.apiRequest('/referents', params);
  }

  // Artist endpoints
  async artist(artistId: number): Promise<ApiResponse> {
    return this.apiRequest(`/artists/${artistId}`);
  }

  async artistSongs(
    artistId: number,
    sort: string = 'popularity',
    perPage: number = 20,
    page: number = 1
  ): Promise<ApiResponse> {
    return this.apiRequest(`/artists/${artistId}/songs`, {
      sort,
      per_page: perPage,
      page
    });
  }

  // Album endpoints
  async album(albumId: number, textFormat?: TextFormat): Promise<ApiResponse> {
    const params = textFormat ? { text_format: textFormat } : {};
    return this.apiRequest(`/albums/${albumId}`, params);
  }

  async albumTracks(
    albumId: number,
    perPage: number = 50,
    page: number = 1,
    textFormat?: TextFormat
  ): Promise<ApiResponse> {
    const params = {
      per_page: perPage,
      page,
      ...(textFormat && { text_format: textFormat })
    };
    return this.apiRequest(`/albums/${albumId}/tracks`, params);
  }

  // Annotation endpoints
  async annotation(annotationId: number, textFormat?: TextFormat): Promise<ApiResponse> {
    const params = textFormat ? { text_format: textFormat } : {};
    return this.apiRequest(`/annotations/${annotationId}`, params);
  }

  // User endpoints (requires authentication)
  async account(): Promise<ApiResponse> {
    if (!this.accessToken) {
      throw new Error('Access token required for account endpoint');
    }
    return this.apiRequest('/account');
  }
}