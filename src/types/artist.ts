import { Song } from './song';

export interface ArtistData {
  id: number;
  name: string;
  url: string;
  image_url?: string;
  header_image_url?: string;
  instagram_name?: string;
  twitter_name?: string;
  facebook_name?: string;
  followers_count?: number;
  is_verified?: boolean;
  is_meme_verified?: boolean;
}

export class Artist {
  public data: ArtistData;
  public songs: Song[] = [];

  constructor(data: ArtistData) {
    this.data = data;
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get url(): string {
    return this.data.url;
  }

  get imageUrl(): string | undefined {
    return this.data.image_url || this.data.header_image_url;
  }

  get numSongs(): number {
    return this.songs.length;
  }

  get verified(): boolean {
    return this.data.is_verified || false;
  }

  addSong(song: Song, includeFeatures: boolean = false): Song | null {
    // Check if song is already in the list
    if (this.songs.some(s => s.id === song.id)) {
      return null;
    }

    // Check if this artist is the primary artist or if we include features
    const isPrimaryArtist = song.data.primary_artist.id === this.id;
    const isFeatured = song.data.featured_artists?.some(artist => artist.id === this.id);
    
    if (isPrimaryArtist || (includeFeatures && isFeatured)) {
      this.songs.push(song);
      return song;
    }

    return null;
  }

  song(title: string): Song | null {
    return this.songs.find(song => 
      song.title.toLowerCase() === title.toLowerCase()
    ) || null;
  }

  toJSON() {
    return {
      name: this.name,
      url: this.url,
      imageUrl: this.imageUrl,
      numSongs: this.numSongs,
      songs: this.songs.map(song => song.toJSON()),
      data: this.data
    };
  }
}