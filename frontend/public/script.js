document.addEventListener("DOMContentLoaded", () => {
  const tele = window.Telegram?.WebApp;

  if (!tele) {
    console.error("Telegram WebApp not available.");
    return;
  }
  window.isTele = false;
  const chat = tele.initDataUnsafe.chat_instance;

  const user = tele.initDataUnsafe.user;
  console.log("hoi");
  if (chat && user) {
    console.log("Chat ID:", chat);
    console.log("User ID:", user.id);
    console.log("First Name:", user.first_name);

    window.isTele = true;
    window.chat_id = chat;
    window.user_name = user.first_name;
    // socket.emit('chat-info', {
    //   chat_id: chat, // Use chat.id
    //   user_id: user.id,
    //   user_name: user.first_name,
    // });
  } else {
    console.log("Missing chat or user data.");
  }
});
document.addEventListener("gun-shot", () => {
  const tele = window.Telegram?.WebApp;

  if (tele?.HapticFeedback) {
    tele.HapticFeedback.impactOccurred("heavy");
    setTimeout(() => tele.HapticFeedback.impactOccurred(heavy), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
    setTimeout(() => tele.HapticFeedback.impactOccurred("heavy"), 50);
  }
});
