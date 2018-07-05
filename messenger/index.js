'use strict';
const BootBot = require('bootbot');
const config = require('config');
const fetch = require('node-fetch');
const GIPHY_URL = `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=`;

const echoModule = require('./modules/echo');

const bot = new BootBot({
  accessToken: config.get('access_token'),
  verifyToken: config.get('verify_token'),
  appSecret: config.get('app_secret')
});

bot.module(echoModule);

bot.setGreetingText('Halo! Salam kenal daku Den Bagus');
// bot.setGetStartedButton((payload, chat) => {
//   chat.say('Welcome to BootBot. What are you looking for?');
// });

const askHowAreYou = (convo) => {
  convo.ask(`Apa kabar?`, (payload, convo, data) => {
    convo.say('Baiklah...').then(() => askFavoriteFood(convo));
  });
};

const askName = (convo) => {
  convo.ask(`Nama dikau siapa?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('name', text);
    convo.say(`Oh.. nama dikau ${text}`).then(() => askFavoriteFood(convo));
  });
};

const askFavoriteFood = (convo) => {
  convo.ask(`Makanan kesukaan dikau apa?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('food', text);
    convo.say(`Mantap, makanan paporit dikau ${text}, kalo daku mah sukanya jengkol hihihi 😊`).then(() => askGender(convo));
  });
};

const askGender = (convo) => {
  convo.ask((convo) => {
    const buttons = [
      { type: 'postback', title: 'Cowo', payload: 'GENDER_MALE' },
      { type: 'postback', title: 'Cewe', payload: 'GENDER_FEMALE' },
      { type: 'postback', title: 'Kasih tau ga ya????', payload: 'GENDER_UNKNOWN' }
    ];
    convo.sendButtonTemplate(`Dikau itu cowo apa cewe?`, buttons);
  }, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('gender', text);
    convo.say(`Wah, dikau ${text} ya... Kirain kayak Lucinta Luna 😁🙏`).then(() => askAge(convo));
  }, [
    {
      event: 'postback',
      callback: (payload, convo) => {
        convo.say('Keren bisa nge-klik juga').then(() => askAge(convo));
      }
    },
    {
      event: 'postback:GENDER_MALE',
      callback: (payload, convo) => {
        convo.say('Ga yakin dikau cowo 😜').then(() => askAge(convo));
      }
    },
    {
      event: 'quick_reply',
      callback: () => {}
    },
    {
      event: 'quick_reply:COLOR_BLUE',
      callback: () => {}
    },
    {
      pattern: ['yes', /yea(h)?/i, 'yup'],
      callback: () => {
        convo.say('Dikau bilang YES!').then(() => askAge(convo));
      }
    }
  ]);
};

const askAge = (convo) => {
  convo.ask(`Terakhir nih. Umur dikau numbretong?`, (payload, convo, data) => {
    const text = payload.message.text;
    convo.set('age', text);
    convo.say(`Sip daaah..`).then(() => {
      convo.say(`Jadi dikau bilang ke saya gini ya:
      - Makanan Paporit: ${convo.get('food')}
      - Jenis Kelamin: ${convo.get('gender') !== undefined ? convo.ge('gender') : 'ga dikasih tau. pelit!!!'}
      - Umur: ${convo.get('age')}
      `);
      convo.end();
    });
  });
};

bot.hear(['halo', 'hai', 'hei', 'woy', 'hey', 'hallo', 'hello'], (payload, chat) => {
  chat.getUserProfile().then((user) => {
    chat.say(`Hello, ${user.first_name}!`, { typing: true }).then(() => (
      chat.conversation((convo) => {
        convo.sendTypingIndicator(1000).then(() => askHowAreYou(convo));
      })
    ));
  });
});

bot.hear(['askum', 'assalamualaikum'], (payload, chat) => {
  chat.getUserProfile().then((user) => {
    chat.say(`Walikumsalam ${user.first_name}`, { typing: true }).then(() => (
      chat.conversation((convo) => {
        convo.sendTypingIndicator(1000).then(() => askHowAreYou(convo));
      })
    ));
  });
});

bot.hear(['cek', 'test', 'check', 'testing'], (payload, chat) => {
  chat.say('Gitu doang', { typing: true }).then(() => (
    chat.say('Dikau bisa menanyakan daku apapun. Jika dikau butuh bantuan ketik aja “bantu”', { typing: true })
  ));
});

bot.hear('bantu', (payload, chat) => {
  chat.say('Lah, arep njaluk tulung apa rika, nyong be esih sinau koh 😁', { typing: true });
});

bot.hear(/gif (.*)/i, (payload, chat, data) => {
  const query = data.match[1];
  chat.say('Nyari gif...');
  fetch(GIPHY_URL + query)
    .then(res => res.json())
    .then(json => {
      chat.say({
        attachment: 'image',
        url: json.data.image_url
      }, {
        typing: true
      });
    });
});

bot.hear('warna', (payload, chat) => {
  chat.say({
    text: 'Warna favorit dikau?',
    quickReplies: [ 'Merah', 'Biru', 'Hijau' ]
  });
});

bot.hear('image', (payload, chat) => {
  chat.say({
    attachment: 'image',
    url: 'http://static3.gamespot.com/uploads/screen_medium/1365/13658182/3067965-overwatch-review-promo-20160523_v2.jpg',
    quickReplies: [ 'Red', 'Blue', 'Green' ]
  });
});

bot.hear('tombol', (payload, chat) => {
  chat.say({
    text: 'Pilih tombol',
    buttons: [ 'Cowo', 'Cewe', `Kasih tau ga ya???` ]
  });
});

bot.hear('convo', (payload, chat) => {
  chat.conversation(convo => {
    convo.ask({
      text: 'Warna Paporit?',
      quickReplies: [ 'Merah', 'Biru', 'Hijau' ]
    }, (payload, convo) => {
      const text = payload.message.text;
      convo.say(`Oh warna paporit dikau ${text}, keren!`);
      convo.end();
    }, [
      {
        event: 'quick_reply',
        callback: (payload, convo) => {
          const text = payload.message.text;
          convo.say(`Makasih ya udah milih. Warna paporit dikau ${text}`);
          convo.end();
        }
      }
    ]);
  });
});

bot.start();

