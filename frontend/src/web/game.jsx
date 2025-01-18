import { useState, useEffect } from "react";
import { FaRegHandScissors } from "react-icons/fa";
import { LiaHandPaper } from "react-icons/lia";
import { PiHandFist } from "react-icons/pi";
import { io } from "socket.io-client";
import { useRef } from "react";
import "./style.css";

import themeSong from "../assets/theme.mp3";
import timerS from "../assets/timer.mp3";
import winS from "../assets/win.mp3";
import failS from "../assets/fail.mp3";
import gameOver from "../assets/game_over.mp3";
import gun from "../assets/gunshot.mp3";

import masks from "../assets/try.png";
import scissors from "../assets/scissor.png";
import paper from "../assets/paper.png";
import stone from "../assets/stone.png";
import blood from "../assets/blood.png";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const containerStyle = {
  position: "absolute",
  top: "80%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "300px",
  height: "300px",
  display: "flex", // Enables flexbox
  flexDirection: "row", // Align items horizontally
  justifyContent: "space-between", // Add spacing between items
  alignItems: "center", // Center align items horizontally
  gap: "5%", // Space between items
};

const choices = ["scissors", "paper", "stone"];

function WebView() {
  const [playerChoice, setPLayerChoice] = useState("Player Choice");
  const [finalRes, setFinalRes] = useState(null);
  const [paint1, setPaint] = useState(false);

  const [selectedIcons, setSelectedIcons] = useState([]);
  const [leftHand, setLeftHand] = useState(null);
  const [rightHand, setRightHand] = useState(null);
  const [aiChoices, setAiChoices] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [bothPlayersReady, setBothPlayersReady] = useState(false);

  const [withdrawCountdown, setWithdrawCountdown] = useState(null);
  const [showAiHands, setShowAiHands] = useState(false);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawnHand, setWithdrawnHand] = useState(null);
  const [remainingHand, setRemainingHand] = useState(null);
  const [aiWithdrawnIndex, setAiWithdrawnIndex] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [phase, setPhase] = useState("");

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);

  const [song] = useState(new Audio(themeSong));
  const [timerSound] = useState(new Audio(timerS));
  const [failSound] = useState(new Audio(failS));
  const [winSound] = useState(new Audio(winS));
  const [gameOverSound] = useState(new Audio(gameOver));
  const [gunSound] = useState(new Audio(gun));

  const [gameStarted, setGameStarted] = useState(false);
  const socketRef = useRef(null);

  // Socket Connection Setup
  useEffect(() => {
    socketRef.current = io("https://squidgame-t8v8.onrender.com", {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log(
        `FRONTEND PRINT Connected to server with id: ${socketRef.current.id}`,
      );
    });

    socketRef.current.on("disconnect", () => {
      console.log("FRONTEND PRINT Disconnected from server");
    });

    socketRef.current.on("waiting_for_player", (message) => {
      console.log(message);
    });

    socketRef.current.on("start_game", (message) => {
      console.log(message);
    });

    socketRef.current.on("try_join_tele_game_success", () => {
      handleStartGame();
    });

    socketRef.current.on("error", () => {
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

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Both Players Ready Effect
  useEffect(() => {
    const handleBothPlayersReady = () => {
      console.log("Both players are ready!");
      setBothPlayersReady(true);
    };
    socketRef.current.on("both_players_ready", handleBothPlayersReady);

    return () => {
      socketRef.current.off("both_players_ready", handleBothPlayersReady);
    };
  }, []);

  // Hand Selection Effect
  useEffect(() => {
    if (leftHand != null && rightHand != null) {
      socketRef.current.emit("hand_selection", {
        leftHand: leftHand,
        rightHand: rightHand,
      });
    }
  }, [leftHand, rightHand]);

  // Opponent Hands Effect
  useEffect(() => {
    socketRef.current.on("opponent_both_hands", (opponenthands) => {
      setAiChoices([opponenthands.leftHand, opponenthands.rightHand]);
      console.log(
        `Opponent Left Hand: ${opponenthands.leftHand}, Opponent Right Hand: ${opponenthands.rightHand}`,
      );
    });
  });

  // Opponent Remaining Hand Effect
  useEffect(() => {
    socketRef.current.off("opponent_remaining_hand");

    socketRef.current.on("opponent_remaining_hand", (opponentHandInfo) => {
      const index = aiChoices.findIndex(
        (hand) => hand === opponentHandInfo.withdrawnHand,
      );
      if (index !== -1) {
        setAiWithdrawnIndex(index);
        setPhase("result");
      } else {
        console.log("Withdrawn hand not found in aiChoices");
        setPhase("result");
      }
    });

    return () => {
      socketRef.current.off("opponent_remaining_hand");
    };
  }, [aiChoices]);

  useEffect(() => {
    if (aiScore == 3) {
      setFinalRes("lost");
    }
    if (playerScore == 3) {
      setFinalRes("win");
    }
  }, [aiScore, playerScore]);

  useEffect(() => {
    if (finalRes && finalRes == "lost") {
      setTimeout(() => {
        gameOverSound.volume = 1.0;
        gameOverSound.play();
      }, 3500);
      setTimeout(() => {
        setPaint(true);
      }, 2700);
      setTimeout(() => {
        gunSound.play();
      }, 1500);
    }
  }, [finalRes]);

  useEffect(() => {
    song.volume = 0.1;
    song.loop = true;

    return () => {
      song.pause();
      song.currentTime = 0;
    };
  }, [song]);

  const tryJoinGame = () => {
    socketRef.current.emit("try_join_tele_game", {
      chat_id: window.chat_id,
    });
  };

  const handleStartGame = () => {
    setGameStarted(true);
    socketRef.current.emit("join_game", {
      chat_id: window.chat_id,
      user_name: window.user_name,
    });

    song.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  const handleIconClick = (iconType) => {
    if (phase === "withdraw") {
      if (selectedIcons.includes(iconType) && canWithdraw) {
        handleWithdraw(iconType);
      }
    } else if (selectedIcons.length < 2) {
      setSelectedIcons([...selectedIcons, iconType]);
      if (selectedIcons.length == 1) {
        setLeftHand(iconType);
      } else {
        setRightHand(iconType);
      }
    }
  };

  useEffect(() => {
    if (withdrawCountdown == 3) {
      timerSound.volume = 0.2;
      timerSound.play();
    }
  }, [withdrawCountdown]);

  useEffect(() => {
    if (
      selectedIcons.length === 2 &&
      phase === "" &&
      bothPlayersReady === true
    ) {
      timerSound.volume = 0.2;
      timerSound.play();

      console.log("Left Hand: " + leftHand);
      console.log("Right Hand: " + rightHand);
      setPLayerChoice(`     `);
      let count = 3;
      setCountdown(count);
      setPhase("initial");

      const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countInterval);
          socketRef.current.emit("showOpponentBothHand");
          setShowAiHands(true);
          setCanWithdraw(true);
          setPhase("withdraw");

          let withdrawCount = 5;
          setWithdrawCountdown(withdrawCount);

          const withdrawInterval = setInterval(() => {
            withdrawCount--;
            if (withdrawCount > 0) {
              setWithdrawCountdown(withdrawCount);
            } else {
              clearInterval(withdrawInterval);
              setCanWithdraw(false);
              socketRef.current.emit("getOpponentRemainingHand");
            }
          }, 1000);
        }
      }, 1000);

      return () => {
        clearInterval(countInterval);
      };
    }
  }, [selectedIcons, bothPlayersReady]);

  useEffect(() => {
    if (phase === "result") {
      console.log("Current phase is now result");
      socketRef.current.emit("calculateScore");
    }
  }, [phase]);

  useEffect(() => {
    const handleGameResult = (result) => {
      switch (result) {
        case "withdraw_win":
          setGameResult("Opponent did not withdraw a hand in time. You win!");
          winSound.play();
          setPlayerScore((prevPlayer) => prevPlayer + 1);
          break;

        case "withdraw_lose":
          setGameResult("You didn't withdraw a hand in time! You Lose");
          setAiScore((prevAi) => prevAi + 1);
          setTimeout(() => {
            failSound.play();
          }, 500);
          break;

        case "withdraw_tie":
          setGameResult(
            "Both players did not withdraw a hand in time. It's a tie!",
          );
          console.log("Tie occurred.");
          break;

        case "win":
          setGameResult("You win!");
          winSound.play();
          setPlayerScore((prevPlayer) => prevPlayer + 1);
          break;

        case "lose":
          setGameResult("You Lose!");
          setAiScore((prevAi) => prevAi + 1);
          setTimeout(() => {
            failSound.play();
          }, 500);
          break;

        case "tie":
          setGameResult("It's a tie!");
          console.log("Tie occurred.");
          break;

        default:
          console.error("Unexpected game result:", result);
      }
    };

    // Listen for 'gameResult' event from server
    socketRef.current.on("gameResult", handleGameResult);

    // Cleanup listener on unmount
    return () => {
      socketRef.current.off("gameResult", handleGameResult);
    };
  }, [socketRef, playerScore, aiScore, winSound, failSound]);

  const handleWithdraw = (hand) => {
    if (canWithdraw && !withdrawnHand) {
      const handCount = selectedIcons.filter((icon) => icon === hand).length;

      if (handCount == 2) {
        setWithdrawnHand("left");
        socketRef.current.emit("withdrawHand", "left");
        setRemainingHand(leftHand);
      } else if (handCount == 1) {
        if (hand == leftHand) {
          setWithdrawnHand("left");
          socketRef.current.emit("withdrawHand", "left");
          setRemainingHand(rightHand);
        } else {
          setWithdrawnHand("right");
          socketRef.current.emit("withdrawHand", "right");
          setRemainingHand(leftHand);
        }
      }
    }
  };

  const getIconClassName = (iconType) => {
    return `icon ${selectedIcons.includes(iconType) ? "selected" : ""}`;
  };

  const getHandComponent = (type, isAi = false, isLeft = false) => {
    const hand = {
      height: "280px",
      transform: `${isAi ? "rotate(180deg)" : ""} ${!isAi && isLeft ? "scaleX(-1)" : ""} ${type === "paper" && !isAi ? "scaleX(-1)" : ""}`,
    };

    switch (type) {
      case "scissors":
        return (
          <img
            src={scissors}
            alt="scissors"
            className={`hand ${isAi ? "hand-ai" : ""}`}
            style={hand}
          />
        );
      case "paper":
        return (
          <img
            src={paper}
            alt="paper"
            className={`hand ${isAi ? "hand-ai" : ""}`}
            style={hand}
          />
        );
      case "stone":
        return (
          <img
            src={stone}
            alt="stone"
            className={`hand ${isAi ? "hand-ai" : ""}`}
            style={hand}
          />
        );
      default:
        return null;
    }
  };

  const resetGame = () => {
    setSelectedIcons([]);
    setAiChoices([]);
    setBothPlayersReady(false);
    setCountdown(null);
    setLeftHand(null);
    setRightHand(null);
    setWithdrawCountdown(null);
    setShowAiHands(false);
    setCanWithdraw(false);
    setWithdrawnHand(null);
    setRemainingHand(null);
    setAiWithdrawnIndex(null);
    setGameResult(null);
    setPLayerChoice("Player Choice");
    setPhase("");
    setPaint(false);
    socketRef.current.emit("resetGame");
    console.log("TOLD SERVER TO RESET");
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

      {/* Start Game Button */}
      <div
        className={`start-button-container ${gameStarted ? "fade-out" : ""}`}
      >
        {!gameStarted && (
          <div style={{ textAlign: "center" }}>
            <button onClick={handleStartGame} className="start-button">
              Start Game
            </button>
          </div>
        )}
      </div>

      {/* Game Content */}
      <div className={`game-content ${gameStarted ? "visible" : ""}`}>
        {gameStarted && (
          <>
            <div className="score-box player-score">
              Your Score: {playerScore}
            </div>
            <div className="score-box ai-score">Opponent Score: {aiScore}</div>
            {countdown && phase === "initial" && (
              <div className="countdown">{countdown}</div>
            )}
            {phase === "withdraw" && (
              <>
                <div className="timer-box">
                  Time to withdraw: {withdrawCountdown}s
                </div>
                <div className="sub-instruction">
                  You MUST withdraw one hand!
                </div>
              </>
            )}

            {gameResult && (
              <div>
                <div className="result">{gameResult}</div>
                {finalRes == null && (
                  <button onClick={resetGame} className="reset-button">
                    Play Again
                  </button>
                )}
              </div>
            )}

            <h2>{playerChoice}</h2>

            <div style={containerStyle}>
              <FaRegHandScissors
                className={getIconClassName("scissors")}
                onClick={() => handleIconClick("scissors")}
              />
              <LiaHandPaper
                className={getIconClassName("paper")}
                onClick={() => handleIconClick("paper")}
              />
              <PiHandFist
                className={getIconClassName("stone")}
                onClick={() => handleIconClick("stone")}
              />
            </div>
            {showAiHands && (
              <>
                <div
                  className={`lefthand-ai animated ${
                    aiWithdrawnIndex === 0 ? "withdrawn-ai" : ""
                  }`}
                >
                  {getHandComponent(aiChoices[0], true, true)}
                </div>
                <div
                  className={`righthand-ai animated ${
                    aiWithdrawnIndex === 1 ? "withdrawn-ai" : ""
                  }`}
                >
                  {getHandComponent(aiChoices[1], true, false)}
                </div>
              </>
            )}
            {selectedIcons[0] && (
              <div
                className={`lefthand ${withdrawnHand === "right" ? "withdrawn" : ""}`}
                onClick={() => handleWithdraw(selectedIcons[0])}
              >
                {getHandComponent(selectedIcons[0], false, true)}
              </div>
            )}
            {selectedIcons[1] && (
              <div
                className={`righthand ${withdrawnHand === "left" ? "withdrawn" : ""}`}
                onClick={() => handleWithdraw(selectedIcons[1])}
              >
                {getHandComponent(selectedIcons[1], false, false)}
              </div>
            )}
          </>
        )}
        {paint1 && (
          <img
            src={blood}
            style={{
              width: "1000px",
              position: "fixed",
              top: "-70%",
              left: "20%",
              transform: "translateX(-50%), translateY(50%)",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default WebView;
