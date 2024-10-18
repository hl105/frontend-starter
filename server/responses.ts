import { Authing } from "./app";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friending";
import { SongAuthorNotMatchError, SongDoc } from "./concepts/posting";
import { CommentDoc } from "./concepts/commenting";
import { LockDoc } from "./concepts/locking";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link SongDoc} into a more readable format for the frontend.
 */
export default class Responses {
  /**
   * Convert SongDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async song(song: SongDoc | null) {
    if (!song) {
      return song;
    }
    const author = await Authing.getUserById(song.author);
    return { ...song, author: author.username };
  }


  /**
   * Same as {@link song} but for an array of SongDoc for improved performance.
   */
  static async songs(songs: SongDoc[]) {
    const authors = await Authing.idsToUsernames(songs.map((song) => song.author));
    return songs.map((song, i) => ({ ...song, author: authors[i] }));
  }

  /**
   * Convert CommentDoc into more readable format for the frontend by converting the author id to username.
   */
  static async comment(comment: CommentDoc | null){
    if (!comment){
      return comment;
    }
    const author = await Authing.getUserById(comment.author);
    return { ...comment, comment: author.username};
  }

  /**
   * Same as {@link comment} but for an array of CommentDoc for improved performance.
   */
  static async comments(comments: CommentDoc[]){
    const authors = await Authing.idsToUsernames(comments.map((comment)=> comment.author));
    return comments.map((comment, i) => ({...comment, author: authors[i]}));
  }

  /**
   * Convert LockDoc into a more readable format for frontend by converting the locker id to username.
   */
  static async lock(lock: LockDoc | null){
    if (!lock){
      return lock;
    }
    const locker = await Authing.getUserById(lock.locker);
    return {...lock, lock: locker.username};
  }

  /**
   * Same as {@link lock} but for an array of LockDoc for improved performance.
   */
  static async locks(locks: LockDoc[]){
    const lockers = await Authing.idsToUsernames(locks.map((lock)=> lock.locker));
    return locks.map((lock, i) => ({...lock, locker: lockers[i]}));
  }


  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await Authing.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}

Router.registerError(SongAuthorNotMatchError, async (e) => {
  const username = (await Authing.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.from), Authing.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([Authing.getUserById(e.user1), Authing.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
