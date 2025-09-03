import * as cheerio from 'cheerio';
import { PublicAPI } from './api/client';
import { Song, Artist, Album, SongData, ArtistData, AlbumData, GeniusOptions, SearchResponse } from './types';
import { cleanStr, removeSectionHeaders as removeSectionHeadersUtil } from './utils';

export class Genius extends PublicAPI {
  public verbose: boolean;
  public removeSectionHeaders: boolean;
  public skipNonSongs: boolean;
  public excludedTerms: string[];
  public replaceDefaultTerms: boolean;

  private static readonly DEFAULT_EXCLUDED_TERMS = [
    'track\\s?list',
    'album art(work)?',
    'liner notes',
    'booklet', 
    'credits',
    'interview',
    'skit',
    'instrumental',
    'setlist'
  ];

  constructor(options: GeniusOptions = {}) {
    super(options);
    
    this.verbose = options.verbose !== undefined ? options.verbose : true;
    this.removeSectionHeaders = options.removeSectionHeaders || false;
    this.skipNonSongs = options.skipNonSongs !== undefined ? options.skipNonSongs : true;
    this.replaceDefaultTerms = options.replaceDefaultTerms || false;

    const userExcludedTerms = options.excludedTerms || [];
    if (this.replaceDefaultTerms) {
      this.excludedTerms = userExcludedTerms;
    } else {
      this.excludedTerms = [...Genius.DEFAULT_EXCLUDED_TERMS, ...userExcludedTerms];
    }
  }

  async lyrics(songId?: number, songUrl?: string, removeSectionHeaders?: boolean): Promise<string | null> {
    if (!songId && !songUrl) {
      throw new Error('You must provide either songId or songUrl');
    }

    let path: string;
    if (songUrl) {
      path = songUrl.replace('https://genius.com/', '');
    } else if (songId) {
      const response = await this.song(songId);
      path = response.response.song.path.substring(1);
    } else {
      return null;
    }

    try {
      const webResponse = await this.webRequest(path);
      const $ = cheerio.load(webResponse.html);

      // Remove header divs
      $('div[class*="LyricsHeader__Container"]').remove();

      // Find lyrics containers
      const containers = $('div[data-lyrics-container="true"]');
      if (containers.length === 0) {
        if (this.verbose) {
          console.log(`Couldn't find lyrics section for: https://genius.com/${path}`);
        }
        return null;
      }

      let lyrics = '';
      containers.each((_, container) => {
        const $container = $(container);
        if (!$container.html()) {
          lyrics += '\n';
          return;
        }

        $container.contents().each((_, element) => {
          const $element = $(element);
          if (element.type === 'tag' && element.name === 'br') {
            lyrics += '\n';
          } else if (element.type === 'text') {
            lyrics += $(element).text();
          } else if (element.type === 'tag' && $element.attr('data-exclude-from-selection') !== 'true') {
            lyrics += $element.text().replace(/\n/g, '\n');
          }
        });
      });

      // Clean up lyrics
      if (this.removeSectionHeaders || removeSectionHeaders) {
        lyrics = removeSectionHeadersUtil(lyrics);
      }

      return lyrics.trim();
    } catch (error) {
      if (this.verbose) {
        console.error('Error fetching lyrics:', error);
      }
      return null;
    }
  }

  private resultIsLyrics(song: any): boolean {
    if (song.lyrics_state !== 'complete' || song.instrumental) {
      return false;
    }

    if (this.excludedTerms.length === 0) {
      return true;
    }

    const expression = this.excludedTerms.map(term => `(${term})`).join('|');
    const regex = new RegExp(expression, 'i');
    return !regex.test(cleanStr(song.title));
  }

  private getItemFromSearchResponse(
    response: SearchResponse,
    searchTerm: string,
    type: 'song' | 'artist' | 'album',
    resultType: string
  ): any | null {
    const allHits = response.response.hits;
    if (!allHits || allHits.length === 0) {
      return null;
    }

    // Filter hits by the requested type
    const hits = allHits.filter(hit => hit.index === type);

    // Patch
    if (hits.length === 0) {
      if (type !== 'song') {
        return allHits[0]
      }
      return null;
    }

    // Try to find exact match
    for (const hit of hits) {
      const item = hit.result;
      if (cleanStr((item as any)[resultType]) === cleanStr(searchTerm)) {
        return item;
      }
    }

    // For songs, try to find first valid lyrics
    if (type === 'song' && this.skipNonSongs) {
      for (const hit of hits) {
        const song = hit.result;
        if (this.resultIsLyrics(song)) {
          return song;
        }
      }
    }

    return hits.length > 0 ? hits[0].result : null;
  }

  async searchSong(title?: string, artist?: string, songId?: number, getFullInfo: boolean = true): Promise<Song | null> {
    if (!title && !songId) {
      throw new Error('You must provide either title or songId');
    }

    if (this.verbose && title) {
      const searchMsg = artist ? `Searching for "${title}" by ${artist}...` : `Searching for "${title}"...`;
      console.log(searchMsg);
    }

    let songInfo: any;

    if (songId) {
      const response = await this.song(songId);
      songInfo = response.response.song;
    } else if (title) {
      const searchTerm = artist ? `${title} ${artist}`.trim() : title.trim();
      const searchResponse = await this.searchAll(searchTerm);
      songInfo = this.getItemFromSearchResponse(searchResponse, title, 'song', 'title');
    }

    if (!songInfo) {
      if (this.verbose && title) {
        console.log(`No results found for: "${title}"`);
      }
      return null;
    }

    // Check if result is valid lyrics
    if (this.skipNonSongs && !this.resultIsLyrics(songInfo)) {
      if (this.verbose) {
        console.log('Specified song does not contain lyrics. Rejecting.');
      }
      return null;
    }

    // Get full info if requested and we don't already have it
    if (!songId && getFullInfo) {
      const fullResponse = await this.song(songInfo.id);
      Object.assign(songInfo, fullResponse.response.song);
    }

    // Fetch lyrics
    let lyricsContent = '';
    if (songInfo.lyrics_state === 'complete' && !songInfo.instrumental) {
      lyricsContent = await this.lyrics(undefined, songInfo.url) || '';
    }

    // Skip if no valid lyrics found
    if (this.skipNonSongs && !lyricsContent) {
      if (this.verbose) {
        console.log('Specified song does not have valid lyrics. Rejecting.');
      }
      return null;
    }

    const song = new Song(lyricsContent, songInfo as SongData);
    
    if (this.verbose) {
      console.log('Done.');
    }

    return song;
  }

  async searchArtist(
    artistName: string,
    maxSongs?: number,
    sort: string = 'popularity',
    perPage: number = 20,
    getFullInfo: boolean = true,
    allowNameChange: boolean = true,
    artistId?: number,
    includeFeatures: boolean = false
  ): Promise<Artist | null> {
    
    const findArtistId = async (searchTerm: string): Promise<number | null> => {
      if (this.verbose) {
        console.log(`Searching for songs by ${searchTerm}...\n`);
      }

      const response = await this.searchAll(searchTerm);
      const foundArtistSong = this.getItemFromSearchResponse(response, searchTerm, 'artist', 'name');

      if (!foundArtistSong) {
        if (this.verbose) {
          console.log(`No results found for '${searchTerm}'.`);
        }
        return null;
      }

      return foundArtistSong.result.primary_artist.id;
    };
    // Get artist ID
    const finalArtistId = artistId || await findArtistId(artistName);
    console.log(111, finalArtistId);
    if (!finalArtistId) {
      return null;
    }

    const artistResponse = await this.artist(finalArtistId);
    const artistInfo = artistResponse.response.artist;
    const foundName = artistInfo.name;

    if (foundName !== artistName && allowNameChange) {
      if (this.verbose) {
        console.log(`Changing artist name to '${foundName}'`);
      }
      artistName = foundName;
    }

    // Create Artist object
    const artist = new Artist(artistInfo as ArtistData);

    // Download songs
    let page: number | null = 1;
    const reachedMaxSongs = maxSongs === 0;

    while (page && !reachedMaxSongs) {
      const songsResponse = await this.artistSongs(finalArtistId, sort, perPage, page);
      const songsData = songsResponse.response.songs;

      for (const songInfo of songsData) {
        // Check if song is valid
        if (this.skipNonSongs && !this.resultIsLyrics(songInfo)) {
          if (this.verbose) {
            console.log(`"${songInfo.title}" is not valid. Skipping.`);
          }
          continue;
        }

        // Fetch lyrics
        let lyricsContent = '';
        if (songInfo.lyrics_state === 'complete') {
          lyricsContent = await this.lyrics(undefined, songInfo.url) || '';
        }

        // Get full info if requested
        if (getFullInfo) {
          const fullSongResponse = await this.song(songInfo.id);
          Object.assign(songInfo, fullSongResponse.response.song);
        }

        const song = new Song(lyricsContent, songInfo as SongData);
        const addResult = artist.addSong(song, includeFeatures);

        if (addResult && this.verbose) {
          console.log(`Song ${artist.numSongs}: "${song.title}"`);
        }

        // Check if max songs reached
        if (maxSongs && artist.numSongs >= maxSongs) {
          if (this.verbose) {
            console.log(`\nReached user-specified song limit (${maxSongs}).`);
          }
          page = null;
          break;
        }
      }

      page = songsResponse.response.next_page;
    }

    if (this.verbose) {
      console.log(`Done. Found ${artist.numSongs} songs.`);
    }

    return artist;
  }

  async searchAlbum(albumId: number): Promise<Album | null> {
    if (!albumId) {
      throw new Error('You must provide albumId');
    }

    if (this.verbose) {
      console.log(`Fetching album with ID: ${albumId}...`);
    }

    let albumInfo: any;

    const response = await this.album(albumId);
    albumInfo = response.response.album;

    if (!albumInfo) {
      if (this.verbose) {
        console.log(`No album found for ID: ${albumId}`);
      }
      return null;
    }

    const finalAlbumId = albumInfo.id;
    const tracks: Song[] = [];
    let nextPage: number | null = 1;

    // Fetch album tracks (could be more than 50 songs)
    while (nextPage) {
      const tracksResponse = await this.albumTracks(finalAlbumId, 50, nextPage);
      const tracksData = tracksResponse.response.tracks;

      for (const trackData of tracksData) {
        const songInfo = trackData.song;
        let songLyrics = '';

        if (songInfo.lyrics_state === 'complete' && !songInfo.instrumental) {
          songLyrics = await this.lyrics(undefined, songInfo.url) || '';
        }

        tracks.push(new Song(songLyrics, songInfo as SongData));
      }

      nextPage = tracksResponse.response.next_page;
    }

    return new Album(albumInfo as AlbumData, tracks);
  }
}