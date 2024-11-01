import { ObjectId } from "mongodb";

import axios from "axios";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

interface SpotifyArtist {
  name: string;
}

export interface SongDoc extends BaseDoc {
  track_id: string;
  author: ObjectId; // e.g. user who listened to Spotify Song
  artist: string;
  name: string;
  album: string;
  album_cover: string;
  url: string;
  lyrics: string;
}

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly songs: DocCollection<SongDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.songs = new DocCollection<SongDoc>(collectionName);
  }

  async create(author: ObjectId, accessToken: string) {
    let currentlyPlayingSong;
    try {
      const spotifyResponse = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (spotifyResponse.status === 200 && spotifyResponse.data) {
        const track = spotifyResponse.data.item;
        const albumCover = track.album.images.length > 0 ? track.album.images[0].url : null;
        currentlyPlayingSong = {
          track_id: track.id,
          artist: track.artists.map((artist: SpotifyArtist) => artist.name).join(", "),
          name: track.name,
          album: track.album.name,
          album_cover: albumCover,
          url: track.external_urls.spotify,
          lyrics: "", // will have to use external api, empty for now
        };
      } else {
        throw new Error("No song currently playing or response failed");
      }
    } catch (error) {
      throw new Error("Error fetching currently playing song.");
    }
    const existingSong = await this.songs.readOne({ track_id: currentlyPlayingSong.track_id });

    if (existingSong) {
      this.update(existingSong._id) //update dateUpdated
      // console.log("Song updated", existingSong);
      return { msg: "Song already exists in the database", song: existingSong };
    }

    const _id = await this.songs.createOne({ author, ...currentlyPlayingSong });
    return { msg: "Song successfully created!", song: await this.songs.readOne({ _id }) };
  }

  async getSongs() {
    // Returns all songs! You might want to page for better client performance
    return await this.songs.readMany({}, { sort: { _id: -1 } });
  }

  async getSongById(_id: ObjectId) {
    return await this.songs.readOne({ _id });
  }

  async getByAuthor(author: ObjectId) {
    return await this.songs.readMany({ author });
  }

  async getByTrackId(trackId: string) {
    return await this.songs.readOne({ trackId });
  }

  async getMostRecentSong(userId: ObjectId){
    const recentSong = await this.songs.collection.findOne({ author: userId }, {sort: { dateUpdated: -1 }});
    // console.log("recent song",recentSong);
    if (recentSong){
      return recentSong;
    }
    else{
      return null;
    }
  }

  async update(_id: ObjectId) {
    await this.songs.partialUpdateOne({ _id }, {}); // need to test
    return { msg: "Song successfully updated!" };
  }

  async delete(_id: ObjectId) {
    await this.songs.deleteOne({ _id });
    return { msg: "Song deleted successfully!" };
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const song = await this.songs.readOne({ _id });
    if (!song) {
      throw new NotFoundError(`Song ${_id} does not exist!`);
    }
    if (song.author.toString() !== user.toString()) {
      throw new SongAuthorNotMatchError(user, _id);
    }
  }

  async assertSongExists(_id: ObjectId) {
    const maybeSong = await this.songs.readOne({ _id });
    if (maybeSong === null) {
      throw new NotFoundError(`Song not found!`);
    }
  }
}

export class SongAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of song {1}!", author, _id);
  }
}
