import { ObjectId } from "mongodb";

import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Authing, Covering, Friending, Locking, Posting, Sessioning, Snapshoting } from "./app";
import { SessionDoc } from "./concepts/sessioning";
import { Router, getExpressRouter } from "./framework/router";
import Responses from "./responses";
import passport from "./spotifyStrategy";

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL;
console.log("frontend url:", frontendUrl);

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/spotify")
  spotifyLogin(session: SessionDoc, req: Request, res: Response) {
    try {
      Sessioning.isLoggedOut(session);
      console.log("session is logged out");
      passport.authenticate("spotify")(req, res);
    } catch (err: any) {
      return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
    }
  }

  @Router.get("/spotify/callback")
  spotifyCallback(session: SessionDoc, req: Request, res: Response, next: NextFunction) {
    passport.authenticate("spotify", { failureRedirect: "/error" }, (err: Error, user: any, info: any) => {
      if (err) {
        return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        return res.redirect(`/?error=Authentication failed`);
      }
      req.logIn(user, function (err) {
        if (err) {
          return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
        }
        Sessioning.start(req.session, user._id);
        req.session.save(() => {
          return res.redirect(`${frontendUrl}/?success=Authentication successful`);
        });
      });
    })(req, res, next);
  }

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    const user = await Authing.getUserByUsername(username);
    // console.log("user", user);
    return user;
  }

  @Router.get("/users/id/:userId")
  async getUserByUserId(userId?: string) {
    const _id = new ObjectId(userId);
    const user = await Authing.getUserById(_id);
    return user;
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    Covering.deleteByAuthor(user);
    Snapshoting.deleteByAuthor(user);
    Locking.deleteByLocker(user);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc, req: any, res: any) {
    Sessioning.end(session);
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ msg: "Error logging out." });
      }
      res.clearCookie("connect.sid");
      return;
    });
  }

  @Router.get("/songs/recent")
  async getRecentSong(session: SessionDoc) {
    const userId = Sessioning.getUser(session);
    const _userId = new ObjectId(userId);
    const recentSong = await Posting.getMostRecentSong(_userId);

    return { msg: "recentSongId", recentSong: recentSong };
  }

  @Router.get("/songs/:username?")
  async getSongs(username?: string) {
    let posts;
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getSongs();
    }
    return Responses.songs(posts);
  }

  @Router.get("/songs/id/:songId?")
  async getSongInfo(songId: string) {
    // console.log("Received songId:", songId);
    const _songId = new ObjectId(songId);
    const songinfo = await Posting.getSongById(_songId);
    // console.log("songinfo", songinfo);
    return songinfo;
  }

  @Router.post("/songs")
  async createSong(session: SessionDoc) {
    const userId = Sessioning.getUser(session);
    await Authing.updateSpotifyAccessToken(userId);
    const updatedAccessToken = (await Authing.getUserById(userId)).accessToken;
    // console.log("updatedAccessToken", updatedAccessToken);
    const created = await Posting.create(userId, updatedAccessToken);
    // console.log("trying to get currently listening song...");
    return { msg: created.msg, song: created.song };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid);
  }

  @Router.delete("/songs/:id?")
  async deleteSong(session: SessionDoc, _id?: string) {
    if (_id) {
      const user = Sessioning.getUser(session);
      const oid = new ObjectId(_id);
      await Posting.assertAuthorIsUser(oid, user);
      return Posting.delete(oid);
    }
    return { msg: "no id given to delete!" };
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const requests = await Responses.friendRequests(await Friending.getRequests(user));
    // console.log("currentuser's requests", requests);
    return requests
  }

  @Router.get("/friend/outgoing-requests")
  async getOutgoingRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const requests = await Responses.friendRequests(await Friending.getOutgoingRequests(user));
    // console.log("currentuser's outgoing requests", requests);
    return requests
  }

  @Router.get("/friend/incoming-requests")
  async getIncomingRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const requests = await Responses.friendRequests(await Friending.getIncomingRequests(user));
    // console.log("currentuser's incoming requests", requests);
    return requests
  }


  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  @Router.get("/covers/notLocked/:username?")
  async getNotLockedCovers(username?: string) {
    const lockedCoverIds = await Locking.getContentIDsAfterCleanup();
    // console.log("Locked Cover", lockedCoverIds);

    let covers;
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      covers = await Covering.getByAuthor(id);
      // console.log("ALL covers", covers);
    } else {
      covers = await Covering.getComments();
    }
    covers = covers.filter((cover) => !lockedCoverIds.includes(cover._id.toString()));
    // console.log("unlocked covers",covers);
    // return Responses.comments(covers); //not working need to debug later
    return covers;
  }

  @Router.get("/snapshots/all/:username?")
  async getSnapshotsByUsername(username?: string) {
    let snapshots;
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      snapshots = await Snapshoting.getByAuthor(id);
    } else {
      snapshots = await Snapshoting.getComments();
    }
    return Responses.comments(snapshots);
  }

  @Router.get("/snapshots/notExpired/:username?")
  async getSnapshotsNotExpired(username?: string) {
    let snapshots;
    if (username) {
      const id = (await Authing.getUserByUsername(username))._id;
      snapshots = await Snapshoting.getNotExpiredByAuthor(id);
    } else {
      snapshots = await Snapshoting.getNotExpiredComments();
    }
    return Responses.comments(snapshots);
  }

  @Router.get("/covers")
  async getCoversByUserAndSong(userId?: string, songId?: string) {
    let covers;

    if (userId && songId) {
      const userOid = new ObjectId(userId);
      const songOid = new ObjectId(songId);
      covers = await Covering.getByAuthorAndPost(userOid, songOid);
    } else if (userId) {
      const userOid = new ObjectId(userId);
      covers = await Covering.getByAuthor(userOid);
    } else {
      console.log("No params provided");
      covers = await Covering.getComments();
    }
    return Responses.comments(covers);
  }

  @Router.post("/covers")
  async createCover(session: SessionDoc, songId: string, text: string, lyrics: string, image: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(songId);
    const created = await Covering.create(oid, user, text, lyrics, image);
    return { msg: created.msg, cover: await Responses.comment(created.comment) };
  }

  @Router.post("/snapshots")
  async createSnapshot(session: SessionDoc, songId: string, text: string, lyrics: string, image: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(songId);
    const created = await Snapshoting.create(oid, user, text, lyrics, image, false); // snapshots expire!
    return { msg: created.msg, snapshot: await Responses.comment(created.comment) };
  }

  @Router.patch("/cover/:coverId")
  async updateCover(session: SessionDoc, coverId: string, text?: string, lyrics?: string, image?: string) {
    const user = Sessioning.getUser(session);
    const coverOid = new ObjectId(coverId);
    await Covering.assertAuthorIsUser(coverOid, user);
    return await Covering.update(coverOid, text, lyrics, image);
  }

  // you cannot update a snapshot.

  @Router.delete("/snapshots/:snapshotId")
  async deleteSnapshot(session: SessionDoc, snapshotId: string) {
    const user = Sessioning.getUser(session);
    const snapshotOid = new ObjectId(snapshotId);
    await Covering.assertAuthorIsUser(snapshotOid, user);
    return Covering.delete(snapshotOid);
  }

  @Router.delete("/covers/:coverId")
  async deleteCover(session: SessionDoc, coverId: string) {
    const user = Sessioning.getUser(session);
    const coverOid = new ObjectId(coverId);
    const lock = await Locking.getByContent(coverOid);
    await Covering.assertAuthorIsUser(coverOid, user);
    if (lock) {
      await Locking.delete(lock._id);
    }
    return Covering.delete(coverOid);
  }

  @Router.get("/locks/:locker?")
  @Router.validate(z.object({ locker: z.string().optional() }))
  async getLocks(locker?: string) {
    let locks;
    if (locker) {
      const id = (await Authing.getUserByUsername(locker))._id;
      locks = await Locking.getByLocker(id);
    } else {
      locks = await Locking.getLocks();
    }
    // return Responses.locks(locks);
    return locks;
  }

  @Router.post("/locks")
  async createLock(session: SessionDoc, comment: string, from: Date, to: Date) {
    const user = Sessioning.getUser(session);
    const commentId = new ObjectId(comment);
    await Covering.assertAuthorIsUser(commentId, user); // lock a comment only when user made it
    const created = await Locking.create(commentId, user, from, to);
    return { msg: created.msg, post: await Responses.lock(created.lock) };
  }

  @Router.patch("/locks/:id")
  async updateLock(id: string) {
    return { msg: "You can't update a lock!" };
  }

  //no delete because you only delete locks when you delete comment
  // i.e. delete is up in the comment sync

  //no patch because you can't update createDate, CommentID
  //no delete because you only delete expiration when you delete comment
  // i.e. delete is up in the comment sync
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
 