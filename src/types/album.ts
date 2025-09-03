import { Song } from './song';
import { ArtistData } from './artist';

export interface AlbumData {
  id: number;
  name: string;
  url: string;
  cover_art_url?: string;
  full_title: string;
  release_date_for_display?: string;
  artist: ArtistData;
  description?: {
    html?: string;
    plain?: string;
  };
  song_pageviews?: number;
}

export class Album {
  public data: AlbumData;
  public tracks: Song[] = [];

  constructor(data: AlbumData, tracks: Song[] = []) {
    this.data = data;
    this.tracks = tracks;
  }

  get id(): number {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get fullTitle(): string {
    return this.data.full_title;
  }

  get url(): string {
    return this.data.url;
  }

  get coverArtUrl(): string | undefined {
    return this.data.cover_art_url;
  }

  get releaseDate(): string | undefined {
    return this.data.release_date_for_display;
  }

  get artist(): ArtistData {
    return this.data.artist;
  }

  get artistName(): string {
    return this.data.artist.name;
  }

  get description(): string | undefined {
    return this.data.description?.plain;
  }

  get numTracks(): number {
    return this.tracks.length;
  }

  get pageviews(): number | undefined {
    return this.data.song_pageviews;
  }

  track(title: string): Song | null {
    return this.tracks.find(track => 
      track.title.toLowerCase() === title.toLowerCase()
    ) || null;
  }

  toJSON() {
    return {
      name: this.name,
      fullTitle: this.fullTitle,
      url: this.url,
      coverArtUrl: this.coverArtUrl,
      releaseDate: this.releaseDate,
      artist: this.artistName,
      description: this.description,
      numTracks: this.numTracks,
      tracks: this.tracks.map(track => track.toJSON()),
      data: this.data
    };
  }

  saveLyrics(filename?: string): void {
    // This would save the album's lyrics to a file
    // Implementation would depend on Node.js file system operations
    const fs = require('fs');
    
    const albumData = this.toJSON();
    const jsonContent = JSON.stringify(albumData, null, 2);
    const defaultFilename = `${this.artistName} - ${this.name}.json`.replace(/[<>:"/\\|?*]/g, '_');
    const filepath = filename || defaultFilename;
    
    fs.writeFileSync(filepath, jsonContent, 'utf8');
  }
}