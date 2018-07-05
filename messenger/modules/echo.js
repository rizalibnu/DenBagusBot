'use strict';
module.exports = (bot) => {
  bot.on('message', (payload, chat, data) => {
    const text = payload.message.text;
    if (data.captured) { return; }
    chat.say('maafkan daku yang belum banyak memahami kata2 dikau, daku janji akan belajar lebih giat lagi. 🙏');
  });
};
