document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000');

    const tele = window.Telegram.WebApp;
  
    // Access the WebAppChat object
    const chat = tele.initDataUnsafe.chat;
  
    // Check if chat object is available
    if (chat) {
      console.log('Chat ID:', chat.id);
      console.log('Chat Type:', chat.type);
      console.log('Chat Title:', chat.title);
    } else {
      console.log('No chat data available. Ensure the WebApp is opened in the appropriate chat context.');
    }
  
    // You can also access other properties of the WebApp
    console.log('User Info:', tele.initDataUnsafe.user);
    console.log('Theme Params:', tele.themeParams);
    console.log('Platform:', tele.platform);
  
    // Example: Sending the chat_id to your server via Socket.IO

    socket.emit('chat-info', {
      chat_id: chat?.id, // Use optional chaining in case chat is null
      user_id: tele.initDataUnsafe.user?.id,
    });
  });


  