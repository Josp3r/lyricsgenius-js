export * from './song';
export * from './artist';
export * from './album';

export type ResponseFormat = 'plain' | 'html' | 'dom';
export type TextFormat = 'plain' | 'html' | 'markdown' | 'dom';

export interface GeniusOptions {
  accessToken?: string;
  responseFormat?: ResponseFormat;
  timeout?: number;
  sleepTime?: number;
  verbose?: boolean;
  removeSectionHeaders?: boolean;
  skipNonSongs?: boolean;
  excludedTerms?: string[];
  replaceDefaultTerms?: boolean;
  retries?: number;
  userAgent?: string;
  proxy?: {
    host: string;
    port: number;
    type?: 'http' | 'socks';
    auth?: {
      username: string;
      password: string;
    };
  };
}

interface SearchItem {
  highlights: any[];
  index: string;
  type: string;
  result: SearchResult;
}

export interface SearchResult {
  annotation_count: number;
  api_path: string;
  artist_names: string;
  full_title: string;
  header_image_thumbnail_url: string;
  header_image_url: string;
  id: number;
  lyrics_owner_id: number;
  lyrics_state: string;
  path: string;
  primary_artist_names: string;
  pyongs_count: number;
  relationships_index_url: string;
  release_date_components: Releasedatecomponents;
  release_date_for_display: string;
  release_date_with_abbreviated_month_for_display: string;
  song_art_image_thumbnail_url: string;
  song_art_image_url: string;
  stats: Stats;
  title: string;
  title_with_featured: string;
  url: string;
  featured_artists: any[];
  primary_artist: Primaryartist;
  primary_artists: Primaryartist[];
}

interface Primaryartist {
  api_path: string;
  header_image_url: string;
  id: number;
  image_url: string;
  is_meme_verified: boolean;
  is_verified: boolean;
  name: string;
  url: string;
  iq: number;
}

interface Stats {
  unreviewed_annotations: number;
  concurrents: number;
  hot: boolean;
  pageviews: number;
}

interface Releasedatecomponents {
  year: number;
  month: number;
  day: number;
}

export interface SearchResponse {
  meta: {
    status: number;
  };
  response: {
    hits: SearchItem[];
  };
}

export interface ApiResponse<T = any> {
  meta: {
    status: number;
  };
  response: T;
}