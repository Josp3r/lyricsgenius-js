export interface SongData {
  id: number;
  title: string;
  url: string;
  path: string;
  lyrics_state: string;
  instrumental?: boolean;
  primary_artist: {
    id: number;
    name: string;
    url: string;
    header_image_url?: string;
  };
  featured_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  producer_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  writer_artists?: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  album?: {
    id: number;
    name: string;
    url: string;
  };
  release_date_for_display?: string;
  song_art_image_url?: string;
  stats?: {
    hot: boolean;
    unreviewed_annotations: number;
    concurrents?: number;
    pageviews?: number;
  };
}

export class Song {
  public lyrics: string;
  public data: SongData;

  constructor(lyrics: string = '', data: SongData) {
    this.lyrics = lyrics;
    this.data = data;
  }

  get id(): number {
    return this.data.id;
  }

  get title(): string {
    return this.data.title;
  }

  get url(): string {
    return this.data.url;
  }

  get artist(): string {
    return this.data.primary_artist.name;
  }

  get album(): string | undefined {
    return this.data.album?.name;
  }

  get releaseDate(): string | undefined {
    return this.data.release_date_for_display;
  }

  get instrumental(): boolean {
    return this.data.instrumental || false;
  }

  get lyricsState(): string {
    return this.data.lyrics_state;
  }

  get hasLyrics(): boolean {
    return this.lyrics.length > 0;
  }

  toJSON() {
    return {
      title: this.title,
      artist: this.artist,
      album: this.album,
      lyrics: this.lyrics,
      url: this.url,
      releaseDate: this.releaseDate,
      data: this.data
    };
  }
}