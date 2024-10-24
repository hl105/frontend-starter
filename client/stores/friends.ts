// import { defineStore } from "pinia";
// import { ref } from "vue";
// import { fetchy } from "@/utils/fetchy";

// export interface User {
//   _id: string;
//   username: string;
//   profileImage?: string;
// }

// export const useFriendStore = defineStore("friendStore", () => {
//   const friends = ref<User[]>([]);
//   const incomingRequests = ref<User[]>([]);
//   const outgoingRequests = ref<User[]>([]);

//   const fetchFriends = async () => {
//     try {
//       const response = await fetchy("/api/friends", "GET");
//       friends.value = response;
//     } catch (error) {
//       console.error("Error fetching friends:", error);
//     }
//   };

//   const fetchIncomingRequests = async () => {
//     try {
//       const response = await fetchy("/api/friend/requests", "GET");
//       incomingRequests.value = response.map((request: { from: User }) => request.from);
//     } catch (error) {
//       console.error("Error fetching incoming requests:", error);
//     }
//   };

//   const fetchOutgoingRequests = async () => {
//     try {
//       const response = await fetchy("/api/friend/requests", "GET");
//       outgoingRequests.value = response.map((request: { to: User }) => request.to);
//     } catch (error) {
//       console.error("Error fetching outgoing requests:", error);
//     }
//   };

//   const sendFriendRequest = async (username: string) => {
//     try {
//       await fetchy(`/api/friend/requests/${username}`, "POST");
//       const user = await fetchy(`/api/users/${username}`, "GET");
//       outgoingRequests.value.push(user);
//     } catch (error) {
//       console.error("Error sending friend request:", error);
//     }
//   };

//   const removeFriendRequest = async (username: string) => {
//     try {
//       await fetchy(`/api/friend/requests/${username}`, "DELETE");
//       outgoingRequests.value = outgoingRequests.value.filter((user) => user.username !== username);
//     } catch (error) {
//       console.error("Error removing friend request:", error);
//     }
//   };

//   const acceptFriendRequest = async (username: string) => {
//     try {
//       await fetchy(`/api/friend/accept/${username}`, "PUT");
//       const user = incomingRequests.value.find((user) => user.username === username);
//       if (user) {
//         friends.value.push(user);
//         incomingRequests.value = incomingRequests.value.filter((user) => user.username !== username);
//       }
//     } catch (error) {
//       console.error("Error accepting friend request:", error);
//     }
//   };

//   const rejectFriendRequest = async (username: string) => {
//     try {
//       await fetchy(`/api/friend/reject/${username}`, "PUT");
//       incomingRequests.value = incomingRequests.value.filter((user) => user.username !== username);
//     } catch (error) {
//       console.error("Error rejecting friend request:", error);
//     }
//   };

//   const removeFriend = async (username: string) => {
//     try {
//       await fetchy(`/api/friends/${username}`, "DELETE");
//       friends.value = friends.value.filter((user) => user.username !== username);
//     } catch (error) {
//       console.error("Error removing friend:", error);
//     }
//   };

//   return {
//     friends,
//     incomingRequests,
//     outgoingRequests,
//     fetchFriends,
//     fetchIncomingRequests,
//     fetchOutgoingRequests,
//     sendFriendRequest,
//     removeFriendRequest,
//     acceptFriendRequest,
//     rejectFriendRequest,
//     removeFriend,
//   };
// });
