const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const cors = require("cors");
const { stringify } = require("querystring");
const { json } = require("stream/consumers");

setInterval(
  async () => {
    const res = await fetch("https://squidgame-t8v8.onrender.com");
    console.log(res.status);
  },
  14 * 60 * 1000,
);

const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust this for security in production
  },
});

const PORT = 5000;

// Store connected players
const players = {};
const rooms = {}; // To store game rooms
let roomIdCounter = 1; // Unique room IDs

let player_count = 0;

//check if connect
io.on("connection", (socket) => {
  console.log(`BACKEND PRINT Client connected: ${socket.id}`);
  //initializing player data
  players[socket.id] = {
    name: `Player${Object.keys(players).length + 1}`, // Example: Assign a default name
    score: 0,
    leftHand: null,
    rightHand: null,
    selectedHands: false,
    withdrawnHand: null, // Track the withdrawn hand
    remainingHand: null, // Track the remaining hand
    roomID: null,
    //add a player state to check whether it is playing or spectating
  };

  socket.on("chat-info", (data) => {
    const { chat_id, user_id, user_name } = data;
    console.log("Chat ID:", chat_id);
    console.log("User ID:", user_id);
    console.log("First Name: ", user_name);
    let player = players[socket.id];

    console.log("jmy" + player.name);
    console.log("paul" + player.name);
    players[socket.id] = {
      name: user_name, // Example: Assign a default name
      score: 0,
      leftHand: null,
      rightHand: null,
      selectedHands: false,
      withdrawnHand: null, // Track the withdrawn hand
      remainingHand: null, // Track the remaining hand
      roomID: chat_id,
      //check socket room ID size, if <= 1, player, else spectator
    };
    console.log("paul" + players[socket.id].roomID);

    console.log(`${player.name} attempting to join room: ${chat_id}`);

    // socket.join(chat_id);
    // //Debug: After joining
    // setTimeout(() => {
    //   const room = io.sockets.adapter.rooms.get(chat_id);

    //   if (room) {
    //     console.log(`Room ${chat_id} size after join: ${room.size}`);
    //     console.log('Room members:', Array.from(room));
    //   } else {
    //     console.error(`Room ${chat_id} does not exist after join.`);
    //   }
    // }, 50);
  });

  //update when disconnect
  socket.on("disconnect", () => {
    const roomID = players[socket.id]?.roomID;

    if (roomID) {
      const roomPlayers = Array.from(
        io.sockets.adapter.rooms[roomID]?.sockets || [],
      );
      roomPlayers.forEach((id) => {
        if (id !== socket.id) {
          //this doesnt actually do anything
          io.to(id).emit(
            "waiting_for_player",
            "Waiting for another player to join...",
          );
        }
      });
    }

    player_count--;
    delete players[socket.id];
    console.log(`Player disconnected: ${socket.id}`);
  });

  socket.on("try_join_game", (data) => {
    const { chat_id, user_name } = data;
    const room = io.sockets.adapter.rooms.get(chat_id);
    console.log("room : " + room);
    console.log("Room id: " + chat_id);
    console.log("size: " + io.sockets.adapter.rooms.get(chat_id)?.size);

    if (!room) {
      socket.emit("error");
    } else {
      socket.emit("try_join_game_success", data);
    }
  });

  socket.on("try_join_tele_game", (data) => {
    const { chat_id } = data;
    const roomsize = io.sockets.adapter.rooms.get(chat_id)?.size;
    console.log("Room id: " + chat_id);
    console.log("size: " + io.sockets.adapter.rooms.get(chat_id)?.size);

    if (roomsize >= 2) {
      socket.emit("error");
    } else {
      socket.emit("try_join_tele_game_success", data);
    }
  });

  //when players press the start game button
  socket.on("join_game", (data) => {
    const { chat_id, user_name } = data;
    console.log("Chat ID:", chat_id);
    console.log("First Name: ", user_name);
    let assignedRoom = null;
    const player = players[socket.id];

    player.name = user_name;
    player.leftHand = null;
    player.rightHand = null;
    player.withdrawnHand = null;
    player.remainingHand = null;
    player.roomID = chat_id;
    player.resetCount = 0;

    console.log("join_game socket.id: " + socket.id);
    // Check all the socket rooms that exist, if there is a room with < 2 players, assign this player to
    const roomSize = io.sockets.adapter.rooms.get(player.roomID)?.size || 0;
    if (roomSize < 2) {
      const allRooms = io.sockets.adapter.rooms;
      assignedRoom = chat_id;
      socket.join(chat_id);
      //player.status = playing
    } else {
      io.emit("room-full");
      //player.status = spectating
    }

    // Debug: After joining
    setTimeout(() => {
      const room = io.sockets.adapter.rooms.get(assignedRoom);

      if (room) {
        console.log(`Room ${assignedRoom} size after join: ${room.size}`);
        console.log("Room members:", Array.from(room));
      } else {
        console.error(`Room ${assignedRoom} does not exist after join.`);
      }
    }, 50);

    // Update player data
    if (!players[socket.id]) {
      players[socket.id] = { name: `Player${player_count + 1}` };
    }

    players[socket.id].roomID = assignedRoom;
    player_count++;

    // Emit events based on room size
    setTimeout(() => {
      const roomSize = io.sockets.adapter.rooms.get(assignedRoom)?.size || 0;

      if (roomSize === 1) {
        socket.emit(
          "waiting_for_player",
          "Waiting for another player to join...",
        );
      } else if (roomSize === 2) {
        //change to >= 2
        io.to(assignedRoom).emit("start_game", "Game is starting!");
      } else {
        console.error(
          `Unexpected room size (${roomSize}) for room ${assignedRoom}`,
        );
      }
    }, 50);
  });

  //when selecting a hand
  socket.on("hand_selection", (data) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      console.log("All players: " + JSON.stringify(players));
      console.log("Selected player: " + JSON.stringify(player));
      players[socket.id].leftHand = data.leftHand;
      players[socket.id].rightHand = data.rightHand;
      players[socket.id].selectedHands = true;

      const roomID = player.roomID;
      const room = io.sockets.adapter.rooms.get(roomID);
      console.log("Room members:", Array.from(room));

      const roomPlayers = Array.from(room || []);
      //check allReady and resetCountEqual status for those players with player.status = playing, dont have to check for the rest
      const allReady = roomPlayers.every((id) => players[id]?.selectedHands);
      const resetCountsEqual = roomPlayers.every(
        (id, _, arr) => players[id]?.resetCount === players[arr[0]]?.resetCount,
      );
      console.log(
        "Player readiness status:",
        roomPlayers.map((id) => players[id]?.selectedHands),
      );
      console.log("All players ready:", allReady);
      console.log("Number of people in room:", roomPlayers.length);
      if (allReady && resetCountsEqual && roomPlayers.length === 2) {
        io.to(roomID).emit("both_players_ready");
        console.log(`BACKEND PRINT Both players in ${roomID} are ready.`);
      }
      console.log(
        `BACKEND PRINT Player ${players[socket.id].name} selected hands:`,
        data,
      );
    }
  });

  socket.on("showOpponentBothHand", () => {
    const player = players[socket.id];
    if (player) {
      const roomID = player.roomID;
      const room = io.sockets.adapter.rooms.get(roomID);
      const roomPlayers = Array.from(room || []);
      //opponentID finding needs to change, find other player who player.status = playing
      const opponentId = roomPlayers.find((id) => id !== socket.id);

      if (opponentId) {
        const opponent = players[opponentId];
        const opponentHands = {
          leftHand: opponent.leftHand,
          rightHand: opponent.rightHand,
        };
        socket.emit("opponent_both_hands", opponentHands);
        //how to send the info to a spectator??
        console.log(
          `BACKEND PRINT Sent opponent's hands to Player ${player.name}:`,
          opponentHands,
        );
      } else {
        console.log(`BACKEND PRINT COULD NOT FIND OPPONENT`);
      }
    }
  });

  //in the withdraw hand phase
  socket.on("withdrawHand", (hand) => {
    if (players[socket.id]) {
      const player = players[socket.id];
      if (hand == "left") {
        player.withdrawnHand = player.leftHand;
        player.remainingHand = player.rightHand;
      } else {
        player.withdrawnHand = player.rightHand;
        player.remainingHand = player.leftHand;
      }
      console.log(`BACKEND PRINT Remaining hand: ${player.remainingHand}`);
    }
  });

  //at the end of the countdown
  socket.on("getOpponentRemainingHand", () => {
    const player = players[socket.id];
    if (player) {
      const roomID = player.roomID;
      const room = io.sockets.adapter.rooms.get(roomID);
      const roomPlayers = Array.from(room || []);
      //opponentID finding needs to change, find other player who player.status = playing
      const opponentId = roomPlayers.find((id) => id !== socket.id);

      if (opponentId) {
        const opponent = players[opponentId];
        const opponentHandInfo = {
          withdrawnHand: opponent.withdrawnHand,
          remainingHand: opponent.remainingHand,
        };
        socket.emit("opponent_remaining_hand", opponentHandInfo);
        //need to emit to the spectators also, how to differentiate who is who?
        console.log(
          `BACKEND PRINT Sent opponent's remaining and withdrawn hand to Player ${player.name}:`,
          opponentHandInfo,
        );
      } else {
        console.log(
          `BACKEND PRINT NO OPPONENT FOUND TO SEND WITHDRAW INFORMATION`,
        );
      }
    }
  });

  socket.on("calculateScore", () => {
    console.log("SCORE IS BEING CALCULATED");
    const player = players[socket.id];
    if (player) {
      const roomID = player.roomID;
      const room = io.sockets.adapter.rooms.get(roomID);
      const roomPlayers = Array.from(room || []);
      const opponentId = roomPlayers.find((id) => id !== socket.id);
      const opponent = players[opponentId];

      console.log("Player Remaining Hand " + player.remainingHand);
      console.log("Player Withdrawn Hand " + player.withdrawnHand);
      console.log("Opponent Remaining Hand " + opponent.remainingHand);
      console.log("Opponent Withdrawn Hand " + opponent.withdrawnHand);

      if (player.withdrawnHand !== null && opponent.withdrawnHand === null) {
        socket.emit("gameResult", "withdraw_win");
      } else if (
        player.withdrawnHand === null &&
        opponent.withdrawnHand !== null
      ) {
        socket.emit("gameResult", "withdraw_lose");
      } else if (
        player.withdrawnHand === null &&
        opponent.withdrawnHand === null
      ) {
        socket.emit("gameResult", "withdraw_tie");
      } else {
        const beats = {
          scissors: "paper",
          paper: "stone",
          stone: "scissors",
        };
        if (player.remainingHand === opponent.remainingHand) {
          socket.emit("gameResult", "tie");
        } else if (beats[player.remainingHand] === opponent.remainingHand) {
          socket.emit("gameResult", "win");
        } else {
          socket.emit("gameResult", "lose");
        }
      }
    }
  });

  socket.on("resetGame", () => {
    const player = players[socket.id];
    if (player) {
      // Reset only the ready status so it doesnt break the withdrawl part
      player.selectedHands = false;
      (player.leftHand = null),
        (player.rightHand = null),
        (player.withdrawnHand = null), // Track the withdrawn hand
        (player.remainingHand = null), // Track the remaining hand
        player.resetCount++;
      console.log(`BACKEND PRINT RESETTED: ${player.name}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
