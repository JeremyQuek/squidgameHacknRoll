import "./style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import masks from "../assets/try.png";
import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

function Lobby() {
  const [lobbyState, setLobbyState] = useState(null);
  const [playerName, setPlayerName] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [createRoomStep, setCreateRoomStep] = useState(1); // 1 for name input, 2 for room code display
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const generateID = () => {
    const x = String(Math.floor(100000 + Math.random() * 900000));
    setRoomCode(x);
    return x;
  };


  useEffect(() => {
    socketRef.current = io("https://squidgame-t8v8.onrender.com", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log(`Connected to server with id: ${socketRef.current.id}`);
    });

    socketRef.current.on("waiting_for_player", (message) => {
      console.log(message);
    });

    socketRef.current.on("start_game", (message) => {
      console.log(message);
      window.chat_id = roomCode;
      window.user_name = playerName;
      navigate("/web", {
        state: { shouldStartGame: true },
      });
    });

    socketRef.current.on("error", (data) => {
      toast.error("Room not found", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    });

    socketRef.current.on("try_join_game_success", (data) => {
      socketRef.current.emit("join_game", data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      toast.success('Room code copied to clipboard!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }).catch((err) => {
      toast.error('Failed to copy code', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    });
  };

  const handleCreateRoom = () => {
    if (!playerName) {
      toast.error("Please enter your name", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    const newRoomCode = generateID();
    console.log(newRoomCode);
    console.log(playerName);
    socketRef.current.emit("join_game", {
      chat_id: newRoomCode,
      user_name: playerName,
    });
    setCreateRoomStep(2);
    setLobbyState("create-game");
  };

  const handleCloseRoom = () => {
    setLobbyState(null);
    setRoomCode(null);
    setCreateRoomStep(1);
    setPlayerName(null);
    if (socketRef.current) {
      socketRef.current.emit("close-room", roomCode);
    }
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    if (!playerName) {
      toast.error("Please enter your name", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    if (!roomCode) {
      toast.error("Please enter a room code", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    if (roomCode.length !== 6) {
      toast.error("Room code must be 6 digits", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    if (!/^\d+$/.test(roomCode)) {
      toast.error("Room code must contain only numbers", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
    console.log(roomCode);
    console.log(playerName);
    socketRef.current.emit("try_join_game", {
      chat_id: roomCode,
      user_name: playerName,
    });
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div>
        <img
          src={masks}
          alt="Mask"
          style={{
            width: "300px",
            position: "absolute",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      </div>
      <br />
      <h4 className="cryptic-text">자신의 책임하에 플레이하세요</h4>
      <h1 style={{ marginTop: "300px" }}>SCISSOR PAPER STONE MINUS 1</h1>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {!lobbyState && (
        <>
          <div>
            <button
              onClick={() => setLobbyState("create-game")}
              className="start-button"
            >
              Create Game
            </button>
          </div>
          <div>
            <button
              onClick={() => setLobbyState("join-game")}
              className="start-button"
            >
              Join Game Room
            </button>
          </div>
        </>
      )}

      {lobbyState === "create-game" && (
        <>
          {createRoomStep === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateRoom();
              }}
              style={{
                padding: "15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
                margin: "20px auto",
                width: "300px",
              }}
            >
              <input
                type="text"
                value={playerName || ""}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  padding: "15px",
                  minWidth: "100%",
                  fontSize: "20px",
                  textAlign: "center",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "#333",
                }}
              />
              <input
                type="submit"
                value="Create Room"
                style={{
                  padding: "15px",
                  minWidth: "100%",
                  fontSize: "20px",
                  backgroundColor: "#131415",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              />
            </form>
          ) : (
            <>
              <div>
                <button className="start-button">Room ID is</button>
              </div>
              <div>
                <button
                  className="start-button"
                  onClick={copyToClipboard}
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    fontSize: "25px",
                    marginTop: "5px",
                  }}
                >
                  {roomCode}
                </button>
              </div>
            </>
          )}
          <div>
            <button
              onClick={handleCloseRoom}
              className="start-button"
              style={{ backgroundColor: "#ec584a", marginTop: "50px" }}
            >
              Cancel Room
            </button>
          </div>
          <div>
            <h4>This will terminate the room</h4>
          </div>
        </>
      )}

      {lobbyState === "join-game" && (
        <>
          <form
            onSubmit={handleJoinGame}
            style={{
              padding: "15px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              margin: "20px auto",
              width: "300px",
            }}
          >
            <input
              type="text"
              value={playerName || ""}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              style={{
                padding: "15px",
                minWidth: "100%",
                fontSize: "20px",
                textAlign: "center",
                border: "2px solid #333",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#333",
              }}
            />
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter 6-digit room code"
              style={{
                padding: "15px",
                minWidth: "100%",
                fontSize: "20px",
                textAlign: "center",
                border: "2px solid #333",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "#333",
              }}
            />
            <input
              type="submit"
              value="Join Room"
              style={{
                padding: "15px",
                minWidth: "100%",
                fontSize: "20px",
                backgroundColor: "#131415",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            />
          </form>
          <div>
            <button
              onClick={() => {
                setLobbyState(null);
                setPlayerName(null);
                setRoomCode("");
              }}
              className="start-button"
              style={{
                marginTop: "50px",
                backgroundColor: "#ec584a",
              }}
            >
              Return
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Lobby;
