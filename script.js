/* ============================================================
   木山今咖啡馆 · 第三阶段
   在第二阶段的核心玩法上加入装饰购买与本地存档：
   金币/好评/已购装饰会保存在 localStorage，刷新后恢复。
   ============================================================ */

(function () {
  "use strict";

  // 商品名称、图标、描述和奖励都只在这里维护，订单与菜单共用。
  var PRODUCTS = [
    {
      id: "latte",
      name: "木木特制黄油拿铁",
      shortName: "黄油拿铁",
      emoji: "☕",
      note: "黄油香 · 绵密奶泡",
      reward: 18,
      badge: "人气"
    },
    {
      id: "cake",
      name: "山山特别小蛋糕",
      shortName: "小蛋糕",
      emoji: "🍰",
      note: "今日现烤 · 软乎乎",
      reward: 22
    },
    {
      id: "chicken",
      name: "今今炸鸡",
      shortName: "炸鸡",
      emoji: "🍗",
      note: "酥酥脆脆 · 热乎乎",
      reward: 26
    }
  ];

  // 装饰名称、图标和价格同样只维护在这里。
  var DECORATIONS = [
    { id: "plant", name: "窗台绿植", emoji: "🪴", price: 30 },
    { id: "bouquet", name: "温柔花束", emoji: "💐", price: 60 },
    { id: "lamp", name: "暖黄小灯", emoji: "🏮", price: 90 }
  ];

  // 装饰商店：同一件可以买多个，每个实例独立记录，可自由摆放与收纳。
  var DECOR_SHOP = [
    { id: "plant-pot", name: "绿植盆栽", price: 60, note: "把春天搬进店里" },
    { id: "fairy-lights", name: "暖光小串灯", price: 80, note: "一圈毛茸茸的暖光" },
    { id: "wall-clock", name: "复古挂钟", price: 100, note: "让午后慢一点" },
    { id: "round-table", name: "木质小圆桌", price: 120, note: "靠窗的小小座位" },
    { id: "window-box", name: "窗台花箱", price: 150, note: "窗外开满小花" },
    { id: "bookshelf", name: "迷你书架", price: 180, note: "装下喜欢的书" }
  ];

  // 商品图片用内联 SVG，商店卡片与摆放后的装饰共用同一套画法。
  var DECOR_ART = {
    "plant-pot":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M50 62C50 48 43 38 32 32" fill="none" stroke="#6f8f5e" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M50 62C50 46 57 36 68 30" fill="none" stroke="#6f8f5e" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M50 64V30" fill="none" stroke="#7f9b6e" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="30" cy="30" rx="12" ry="7" transform="rotate(-34 30 30)" fill="#86a874"/>' +
      '<ellipse cx="70" cy="27" rx="12" ry="7" transform="rotate(32 70 27)" fill="#7f9b6e"/>' +
      '<ellipse cx="50" cy="23" rx="8" ry="12" fill="#93b07f"/>' +
      '<path d="M30 56h40l-7 36H37z" fill="#c98e63"/>' +
      '<rect x="26" y="48" width="48" height="12" rx="5" fill="#d8ac7f"/>' +
      '<path d="M37 92h26l-2 4H39z" fill="#b98355" opacity=".55"/>' +
      "</svg>",
    "fairy-lights":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M10 28Q50 58 90 28" fill="none" stroke="#8a6a55" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M20 34v10M35 42v8M50 46v7M65 42v8M80 34v10" stroke="#b98a5e" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="20" cy="50" r="10" fill="#ffe3a3" opacity=".38"/>' +
      '<circle cx="20" cy="50" r="5" fill="#ffd27a"/>' +
      '<circle cx="35" cy="56" r="10" fill="#ffe3a3" opacity=".38"/>' +
      '<circle cx="35" cy="56" r="5" fill="#ffcf72"/>' +
      '<circle cx="50" cy="59" r="10" fill="#ffe3a3" opacity=".38"/>' +
      '<circle cx="50" cy="59" r="5" fill="#ffd27a"/>' +
      '<circle cx="65" cy="56" r="10" fill="#ffe3a3" opacity=".38"/>' +
      '<circle cx="65" cy="56" r="5" fill="#ffcf72"/>' +
      '<circle cx="80" cy="50" r="10" fill="#ffe3a3" opacity=".38"/>' +
      '<circle cx="80" cy="50" r="5" fill="#ffd27a"/>' +
      "</svg>",
    "wall-clock":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M50 8v8" stroke="#b98355" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="50" cy="8" r="3" fill="#b98355"/>' +
      '<circle cx="50" cy="52" r="34" fill="#b98355"/>' +
      '<circle cx="50" cy="52" r="27" fill="#fff8ec"/>' +
      '<circle cx="50" cy="52" r="27" fill="none" stroke="#e7c9a2" stroke-width="2"/>' +
      '<path d="M50 31v5M50 68v5M29 52h5M66 52h5" stroke="#8a6a55" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M50 52V37" stroke="#5b4231" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M50 52l10 7" stroke="#5b4231" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="52" r="3.4" fill="#a9663d"/>' +
      "</svg>",
    "round-table":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<ellipse cx="50" cy="88" rx="30" ry="6" fill="#8a6a55" opacity=".16"/>' +
      '<path d="M36 66l-4 24M64 66l4 24" stroke="#b98355" stroke-width="5" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="60" rx="30" ry="12" fill="#d8ac7f"/>' +
      '<ellipse cx="50" cy="56" rx="30" ry="12" fill="#e8c7a0"/>' +
      '<ellipse cx="50" cy="56" rx="23" ry="8" fill="#f5e2c6"/>' +
      '<path d="M28 62c6 5 38 5 44 0" fill="none" stroke="#c29365" stroke-width="1.6" opacity=".6"/>' +
      "</svg>",
    "window-box":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M30 56c-2-10 0-18 8-22M50 56c0-12 2-20 0-26M70 56c2-10 0-18-8-22" fill="none" stroke="#6f8f5e" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="26" cy="40" rx="9" ry="5" transform="rotate(-40 26 40)" fill="#8fae7c"/>' +
      '<ellipse cx="74" cy="40" rx="9" ry="5" transform="rotate(40 74 40)" fill="#8fae7c"/>' +
      '<ellipse cx="30" cy="26" rx="7" ry="7" fill="#f2b8c2"/>' +
      '<ellipse cx="50" cy="22" rx="8" ry="8" fill="#f6c9d2"/>' +
      '<ellipse cx="70" cy="26" rx="7" ry="7" fill="#f2b8c2"/>' +
      '<circle cx="30" cy="26" r="2.6" fill="#fff3c4"/>' +
      '<circle cx="50" cy="22" r="2.8" fill="#fff3c4"/>' +
      '<circle cx="70" cy="26" r="2.6" fill="#fff3c4"/>' +
      '<rect x="18" y="56" width="64" height="26" rx="6" fill="#b98355"/>' +
      '<rect x="18" y="56" width="64" height="8" rx="4" fill="#d8ac7f"/>' +
      '<path d="M38 64v18M62 64v18" stroke="#a06a3e" stroke-width="2" opacity=".45"/>' +
      "</svg>",
    "bookshelf":
      '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect x="20" y="14" width="60" height="74" rx="6" fill="#b98355"/>' +
      '<rect x="26" y="20" width="48" height="62" rx="3" fill="#fdf1e0"/>' +
      '<rect x="26" y="40" width="48" height="4" fill="#d8ac7f"/>' +
      '<rect x="26" y="60" width="48" height="4" fill="#d8ac7f"/>' +
      '<rect x="30" y="24" width="6" height="16" rx="1.5" fill="#e6a5af"/>' +
      '<rect x="38" y="22" width="7" height="18" rx="1.5" fill="#cdddcb"/>' +
      '<rect x="47" y="25" width="6" height="15" rx="1.5" fill="#f8e7b4"/>' +
      '<rect x="56" y="23" width="7" height="17" rx="1.5" fill="#c98e63"/>' +
      '<rect x="66" y="26" width="5" height="14" rx="1.5" fill="#a8b9d1"/>' +
      '<rect x="30" y="46" width="7" height="14" rx="1.5" fill="#cdddcb"/>' +
      '<rect x="39" y="44" width="6" height="16" rx="1.5" fill="#c98e63"/>' +
      '<rect x="47" y="47" width="7" height="13" rx="1.5" fill="#e6a5af"/>' +
      '<rect x="57" y="45" width="6" height="15" rx="1.5" fill="#f8e7b4"/>' +
      '<rect x="66" y="48" width="5" height="12" rx="1.5" fill="#cdddcb"/>' +
      '<rect x="30" y="66" width="7" height="16" rx="1.5" fill="#f8e7b4"/>' +
      '<rect x="39" y="64" width="6" height="18" rx="1.5" fill="#a8b9d1"/>' +
      '<rect x="47" y="67" width="7" height="15" rx="1.5" fill="#c98e63"/>' +
      '<rect x="57" y="65" width="6" height="17" rx="1.5" fill="#e6a5af"/>' +
      '<rect x="66" y="68" width="5" height="14" rx="1.5" fill="#cdddcb"/>' +
      '<rect x="18" y="86" width="64" height="6" rx="3" fill="#a06a3e"/>' +
      "</svg>"
  };

  // 神秘问答的限定装饰与稀有收藏；id 与商店装饰互不重复。
  var LIMITED_DECORATIONS = [
    {
      id: "limited-bouquet",
      name: "星光花束",
      emoji: "💐",
      rarity: "限定",
      description: "花瓣上像落了星星，神秘顾客说只在今晚开。"
    },
    {
      id: "limited-plant",
      name: "迷你盆栽",
      emoji: "🪴",
      rarity: "限定",
      description: "一小盆认真长大的绿意，放在窗边刚刚好。"
    },
    {
      id: "limited-poster",
      name: "限定挂画",
      emoji: "🖼️",
      rarity: "限定",
      description: "只在这个午后出现的画，挂起来会想起偶遇。"
    }
  ];

  var RARE_COLLECTIBLES = [
    {
      id: "star-badge",
      name: "星星徽章",
      emoji: "⭐",
      rarity: "稀有",
      description: "答对问题的纪念，别在围裙上会微微发亮。"
    },
    {
      id: "memory-medal",
      name: "纪念奖章",
      emoji: "🏅",
      rarity: "珍稀",
      description: "神秘顾客留下的金色小奖章，背面刻着小小的店名。"
    }
  ];

  var COLLECTION_ITEMS = LIMITED_DECORATIONS.concat(RARE_COLLECTIBLES);

  var CUSTOMERS = [
    { name: "小熊同学", avatar: "🐻", hello: "嗨，店长～" },
    { name: "小兔同学", avatar: "🐰", hello: "打扰啦～" },
    { name: "小猫同学", avatar: "🐱", hello: "今天也好香呀～" },
    { name: "小狐狸", avatar: "🦊", hello: "听说这里很好吃！" }
  ];

  var MYSTERY_CUSTOMERS = [
    { id: "bear", name: "熊熊顾客", avatar: "🐻", line: "我带来了一个关于店主的小问题，答对有金币哦～" },
    { id: "dove", name: "鸠顾客", avatar: "🕊️", line: "咕咕～答对的话，这份谢礼请收下。" },
    { id: "fox", name: "狐狸顾客", avatar: "🦊", line: "嘿嘿，答对就告诉你一个秘密……其实是金币啦。" }
  ];

  // 三花猫店员「今」：只做表现层，不参与订单结算。
  var CAT_LINES = [
    "喵～欢迎来到木山今咖啡馆！",
    "我是今，今天也请多关照～",
    "今天也要好好营业呀！",
    "老板，记得休息哦！",
    "这里的咖啡香香的～",
    "柜台擦得亮亮的，喵。",
    "要不要摸摸头，再继续加油？"
  ];
  var CAT_MIN_X = 56;
  var CAT_MAX_X = 92;
  var CAT_FLOOR_Y = 94;
  var CAT_WORK_X = 60;
  var CAT_SPEED = 14;

  var PRODUCT_BY_ID = {};
  PRODUCTS.forEach(function (product) {
    PRODUCT_BY_ID[product.id] = product;
  });

  var DECOR_BY_ID = {};
  DECORATIONS.forEach(function (decor) {
    DECOR_BY_ID[decor.id] = decor;
  });

  var COLLECTION_BY_ID = {};
  COLLECTION_ITEMS.forEach(function (item) {
    COLLECTION_BY_ID[item.id] = item;
  });

  var DECOR_SHOP_BY_ID = {};
  DECOR_SHOP.forEach(function (item) {
    DECOR_SHOP_BY_ID[item.id] = item;
  });

  var SAVE_KEY = "mushanjin-cafe-save-v1";
  var SAVE_VERSION = 1;
  var INITIAL_COINS = 100;
  var MAX_VALUE = 999999999;
  var MYSTERY_MIN = 3;
  var MYSTERY_MAX = 5;
  var QUIZ_REWARD_MIN = 20;
  var QUIZ_REWARD_MAX = 50;
  var REWARD_COIN_RATE = 60;
  var REWARD_DECOR_RATE = 30;
  var DUPLICATE_COMPENSATION = 30;
  var QUIZ_HISTORY_LIMIT = 200;
  var MAX_DECOR_ITEMS = 99;

  var state = {
    coins: INITIAL_COINS,
    reviews: 0,
    owned: [],
    collected: {},
    quizHistory: [],
    orderNo: 0,
    normalOrders: 0,
    mysteryInterval: 0,
    nextMysteryAt: 0,
    order: null,
    decorItems: []
  };

  var els = {};
  var nextCustomerTimer = null;
  var activeMystery = null;
  var lastFocused = null;
  var pendingPlacementUid = null;
  var selectedPlacedUid = null;
  var dragState = null;
  var decorResizeTimer = null;

  var cat = {
    zone: null,
    el: null,
    bubble: null,
    state: "idle",
    x: 74,
    facing: -1,
    targetX: null,
    idleRounds: 0,
    stateTimer: null,
    bubbleTimer: null,
    loopTimer: null,
    lastTick: 0
  };

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function randomMysteryInterval() {
    return MYSTERY_MIN + Math.floor(Math.random() * (MYSTERY_MAX - MYSTERY_MIN + 1));
  }

  function shuffle(list) {
    var copy = list.slice();

    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function getActiveQuestions() {
    var data = window.CAFE_QUIZ_DATA;

    if (!data || !Array.isArray(data.questions)) {
      return [];
    }

    return data.questions.filter(function (question) {
      if (
        !question ||
        question.status !== "active" ||
        question.confirmed !== true ||
        typeof question.question !== "string" ||
        !question.question.trim() ||
        !Array.isArray(question.options) ||
        question.options.length !== 4
      ) {
        return false;
      }

      var validOptions = question.options.every(function (option) {
        return typeof option === "string" && option.trim().length > 0;
      });

      return (
        validOptions &&
        typeof question.answer === "string" &&
        question.options.indexOf(question.answer) !== -1
      );
    });
  }

  function scheduleNextMystery() {
    state.mysteryInterval = randomMysteryInterval();
    state.nextMysteryAt = Math.min(MAX_VALUE, state.normalOrders + state.mysteryInterval);
  }

  function normalizeMysterySchedule() {
    var intervalValid =
      state.mysteryInterval >= MYSTERY_MIN && state.mysteryInterval <= MYSTERY_MAX;
    var remaining = state.nextMysteryAt - state.normalOrders;

    if (!intervalValid) {
      state.mysteryInterval = randomMysteryInterval();
      state.nextMysteryAt = Math.min(MAX_VALUE, state.normalOrders + state.mysteryInterval);
      return;
    }

    if (remaining < 1 || remaining > state.mysteryInterval) {
      state.nextMysteryAt = Math.min(MAX_VALUE, state.normalOrders + state.mysteryInterval);
    }
  }

  function isOwned(decorId) {
    return state.owned.indexOf(decorId) !== -1;
  }

  function sanitizeInteger(value, fallback) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return fallback;
    }

    var integer = Math.floor(value);

    if (integer < 0) {
      return 0;
    }
    if (integer > MAX_VALUE) {
      return MAX_VALUE;
    }
    return integer;
  }

  function loadState() {
    var fallback = {
      coins: INITIAL_COINS,
      reviews: 0,
      owned: [],
      collected: {},
      quizHistory: [],
      mystery: null,
      orderNo: 0,
      normalOrders: 0,
      mysteryInterval: 0,
      nextMysteryAt: 0,
      decorItems: []
    };
    var raw = null;

    try {
      raw = window.localStorage.getItem(SAVE_KEY);
    } catch (error) {
      return fallback;
    }

    if (!raw) {
      return fallback;
    }

    var data = null;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      return fallback;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return fallback;
    }

    var owned = [];

    if (Array.isArray(data.owned)) {
      data.owned.forEach(function (decorId) {
        if (
          typeof decorId === "string" &&
          DECOR_BY_ID[decorId] &&
          owned.indexOf(decorId) === -1
        ) {
          owned.push(decorId);
        }
      });
    }

    var collected = {};

    if (data.collected && typeof data.collected === "object" && !Array.isArray(data.collected)) {
      Object.keys(data.collected).forEach(function (itemId) {
        if (!Object.prototype.hasOwnProperty.call(COLLECTION_BY_ID, itemId)) {
          return;
        }

        var record = data.collected[itemId];
        var at = "";

        if (record && typeof record === "object" && typeof record.at === "string") {
          var time = Date.parse(record.at);
          if (!isNaN(time)) {
            at = new Date(time).toISOString();
          }
        } else if (typeof record === "string") {
          var legacyTime = Date.parse(record);
          if (!isNaN(legacyTime)) {
            at = new Date(legacyTime).toISOString();
          }
        }

        collected[itemId] = { at: at };
      });
    }

    var quizHistory = [];

    if (Array.isArray(data.quizHistory)) {
      data.quizHistory
        .slice(-QUIZ_HISTORY_LIMIT)
        .forEach(function (record) {
          if (!record || typeof record !== "object" || Array.isArray(record)) {
            return;
          }

          var eventId = typeof record.eventId === "string" ? record.eventId : "";
          var questionId = typeof record.questionId === "string" ? record.questionId : "";

          if (!eventId || !questionId) {
            return;
          }

          var at = "";

          if (typeof record.at === "string") {
            var time = Date.parse(record.at);
            if (!isNaN(time)) {
              at = new Date(time).toISOString();
            }
          }

          quizHistory.push({
            eventId: eventId,
            questionId: questionId,
            correct: record.correct === true,
            selectedText:
              typeof record.selectedText === "string" ? record.selectedText : "",
            rewardType: typeof record.rewardType === "string" ? record.rewardType : "",
            rewardAmount: sanitizeInteger(record.rewardAmount, 0),
            itemId: typeof record.itemId === "string" ? record.itemId : "",
            at: at
          });
        });
    }

    var mystery =
      data.mystery && typeof data.mystery === "object" && !Array.isArray(data.mystery)
        ? data.mystery
        : null;

    // 每件已购装饰都是独立实例：x、y 为 null 表示还在库存里。
    var decorItems = [];
    var seenDecorUid = {};

    if (Array.isArray(data.decorItems)) {
      data.decorItems.forEach(function (record) {
        if (!record || typeof record !== "object" || Array.isArray(record)) {
          return;
        }

        var type = typeof record.type === "string" ? record.type : "";

        if (!DECOR_SHOP_BY_ID[type]) {
          return;
        }

        var uid = typeof record.uid === "string" ? record.uid : "";

        if (!uid || seenDecorUid[uid]) {
          return;
        }

        seenDecorUid[uid] = true;

        var x = typeof record.x === "number" && isFinite(record.x) ? record.x : null;
        var y = typeof record.y === "number" && isFinite(record.y) ? record.y : null;

        if (x === null || y === null) {
          x = null;
          y = null;
        }

        decorItems.push({
          uid: uid,
          type: type,
          x: x,
          y: y
        });
      });
    }

    if (decorItems.length > MAX_DECOR_ITEMS) {
      decorItems = decorItems.slice(0, MAX_DECOR_ITEMS);
    }

    return {
      coins: sanitizeInteger(data.coins, INITIAL_COINS),
      reviews: sanitizeInteger(data.reviews, 0),
      owned: owned,
      collected: collected,
      quizHistory: quizHistory,
      mystery: mystery,
      orderNo: sanitizeInteger(data.orderNo, 0),
      normalOrders: sanitizeInteger(data.normalOrders, 0),
      mysteryInterval: sanitizeInteger(data.mysteryInterval, 0),
      nextMysteryAt: sanitizeInteger(data.nextMysteryAt, 0),
      decorItems: decorItems
    };
  }

  function saveState() {
    try {
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          version: SAVE_VERSION,
          coins: state.coins,
          reviews: state.reviews,
          owned: state.owned,
          collected: state.collected,
          quizHistory: state.quizHistory,
          mystery: activeMystery,
          orderNo: state.orderNo,
          normalOrders: state.normalOrders,
          mysteryInterval: state.mysteryInterval,
          nextMysteryAt: state.nextMysteryAt,
          decorItems: state.decorItems
        })
      );
    } catch (error) {
      // 浏览器禁用存储或空间不足时，游戏仍可继续，只是无法保存。
    }
  }

  function clearSave() {
    try {
      window.localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      // 无法访问 localStorage 时忽略即可。
    }
  }

  function renderStats() {
    if (els.coins) {
      els.coins.textContent = String(state.coins);
    }
    if (els.reviews) {
      els.reviews.textContent = String(state.reviews);
    }
  }

  function renderMenu() {
    if (!els.menuList) {
      return;
    }

    PRODUCTS.forEach(function (product) {
      var item = document.createElement("li");
      var button = document.createElement("button");

      button.type = "button";
      button.className = "menu-item";
      button.setAttribute("data-product", product.id);
      button.setAttribute(
        "aria-label",
        "制作并提交" + product.name + "，完成后获得 " + product.reward + " 金币和 1 个好评"
      );

      var icon = document.createElement("span");
      icon.className = "menu-item__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = product.emoji;

      var body = document.createElement("span");
      body.className = "menu-item__body";

      var name = document.createElement("strong");
      name.textContent = product.name;

      if (product.badge) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = product.badge;
        name.appendChild(badge);
      }

      var note = document.createElement("small");
      note.textContent = product.note;

      body.appendChild(name);
      body.appendChild(note);

      var price = document.createElement("span");
      price.className = "menu-item__price";
      price.textContent = "🪙 +" + product.reward;

      button.appendChild(icon);
      button.appendChild(body);
      button.appendChild(price);
      button.addEventListener("click", function () {
        submitProduct(product.id);
      });

      item.appendChild(button);
      els.menuList.appendChild(item);
    });
  }

  function renderDecor() {
    if (!els.decorList) {
      return;
    }

    els.decorList.textContent = "";

    DECORATIONS.forEach(function (decor) {
      var owned = isOwned(decor.id);
      var item = document.createElement("li");
      item.className = "decor-card" + (owned ? " is-owned" : "");
      item.setAttribute("data-decor", decor.id);

      var icon = document.createElement("span");
      icon.className = "decor-card__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = decor.emoji;

      var name = document.createElement("span");
      name.className = "decor-card__name";
      name.textContent = decor.name;

      var price = document.createElement("span");
      price.className = "decor-card__price";
      price.textContent = "🪙 " + decor.price;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "decor-card__buy";

      if (owned) {
        button.textContent = "已拥有";
        button.disabled = true;
        button.setAttribute("aria-label", decor.name + "，已拥有");
      } else {
        button.textContent = "购买";
        button.setAttribute(
          "aria-label",
          "购买" + decor.name + "，价格 " + decor.price + " 金币"
        );
        button.addEventListener("click", function () {
          buyDecoration(decor.id);
        });
      }

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(price);
      item.appendChild(button);
      els.decorList.appendChild(item);
    });
  }

  function setShopDecoration(element, owned) {
    if (!element) {
      return;
    }

    if (owned) {
      element.classList.add("is-owned");
    } else {
      element.classList.remove("is-owned");
    }
  }

  function renderRoomDecor() {
    setShopDecoration(els.shopPlant, isOwned("plant"));
    setShopDecoration(els.shopBouquet, isOwned("bouquet"));
    setShopDecoration(els.shopLamp, isOwned("lamp"));
  }

  function hasCollected(itemId) {
    return Object.prototype.hasOwnProperty.call(state.collected, itemId);
  }

  function formatCollectedAt(value) {
    if (!value) {
      return "";
    }

    var date = new Date(value);

    if (isNaN(date.getTime())) {
      return "";
    }

    var pad = function (number) {
      return number < 10 ? "0" + number : String(number);
    };

    return (
      date.getMonth() +
      1 +
      "月" +
      date.getDate() +
      "日 " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  function buildCollectionCard(item) {
    var owned = hasCollected(item.id);
    var card = document.createElement("article");
    card.className = "collection-card" + (owned ? "" : " is-locked");
    card.setAttribute("data-collection", item.id);

    var icon = document.createElement("span");
    icon.className = "collection-card__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.emoji;

    var body = document.createElement("div");
    body.className = "collection-card__body";

    var head = document.createElement("div");
    head.className = "collection-card__head";

    var name = document.createElement("strong");
    name.className = "collection-card__name";
    name.textContent = item.name;

    var rarity = document.createElement("span");
    rarity.className = "collection-card__rarity";
    rarity.setAttribute("data-rarity", item.rarity);
    rarity.textContent = item.rarity;

    head.appendChild(name);
    head.appendChild(rarity);

    var description = document.createElement("p");
    description.className = "collection-card__desc";
    description.textContent = item.description;

    var record = document.createElement("p");
    record.className = "collection-card__record";

    if (owned) {
      var formatted = formatCollectedAt(state.collected[item.id].at);
      record.textContent = formatted ? "神秘问答 · " + formatted : "已获得";
    } else {
      record.textContent = "未解锁";
    }

    body.appendChild(head);
    body.appendChild(description);
    body.appendChild(record);
    card.appendChild(icon);
    card.appendChild(body);
    return card;
  }

  function renderCollection() {
    if (!els.cabinetDecor || !els.cabinetRare || !els.cabinetCount) {
      return;
    }

    els.cabinetDecor.textContent = "";
    els.cabinetRare.textContent = "";

    var count = 0;

    LIMITED_DECORATIONS.forEach(function (item) {
      if (hasCollected(item.id)) {
        count += 1;
      }
      els.cabinetDecor.appendChild(buildCollectionCard(item));
    });

    RARE_COLLECTIBLES.forEach(function (item) {
      if (hasCollected(item.id)) {
        count += 1;
      }
      els.cabinetRare.appendChild(buildCollectionCard(item));
    });

    els.cabinetCount.textContent = count + " / " + COLLECTION_ITEMS.length;
  }

  function renderLimitedShelf() {
    if (!els.limitedShelf || !els.limitedShelfItems) {
      return;
    }

    els.limitedShelfItems.textContent = "";

    var owned = LIMITED_DECORATIONS.filter(function (item) {
      return hasCollected(item.id);
    });

    if (!owned.length) {
      els.limitedShelf.classList.add("is-hidden");
      return;
    }

    els.limitedShelf.classList.remove("is-hidden");

    owned.forEach(function (item) {
      var chip = document.createElement("span");
      chip.className = "limited-display";
      chip.setAttribute("data-limited", item.id);
      chip.setAttribute("title", item.description);

      var icon = document.createElement("span");
      icon.className = "limited-display__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.emoji;

      var name = document.createElement("span");
      name.className = "limited-display__name";
      name.textContent = item.name;

      chip.appendChild(icon);
      chip.appendChild(name);
      els.limitedShelfItems.appendChild(chip);
    });
  }

  // ---------- 装饰商店与自由摆放 ----------

  function findDecorItem(uid) {
    for (var i = 0; i < state.decorItems.length; i += 1) {
      if (state.decorItems[i].uid === uid) {
        return state.decorItems[i];
      }
    }

    return null;
  }

  function countDecorOwned(itemId) {
    var count = 0;

    state.decorItems.forEach(function (item) {
      if (item.type === itemId) {
        count += 1;
      }
    });

    return count;
  }

  function countDecorInTray(itemId) {
    var count = 0;

    state.decorItems.forEach(function (item) {
      if (item.type === itemId && item.x === null) {
        count += 1;
      }
    });

    return count;
  }

  function makeDecorUid() {
    var uid = "";

    do {
      uid =
        "d" +
        Date.now().toString(36) +
        "-" +
        Math.floor(Math.random() * 1000000).toString(36);
    } while (findDecorItem(uid));

    return uid;
  }

  function decorArt(itemId) {
    return DECOR_ART[itemId] || "";
  }

  function setDecorShopFeedback(message, tone) {
    if (!els.decorShopFeedback) {
      return;
    }

    els.decorShopFeedback.textContent = message;
    els.decorShopFeedback.classList.remove("is-success", "is-error");

    if (tone === "success") {
      els.decorShopFeedback.classList.add("is-success");
    } else if (tone === "error") {
      els.decorShopFeedback.classList.add("is-error");
    }
  }

  function renderDecorShop() {
    if (!els.decorShopList) {
      return;
    }

    els.decorShopList.textContent = "";

    DECOR_SHOP.forEach(function (item) {
      var owned = countDecorOwned(item.id);
      var inTray = countDecorInTray(item.id);
      var affordable = state.coins >= item.price;
      var card = document.createElement("li");
      var art = document.createElement("span");
      var name = document.createElement("strong");
      var note = document.createElement("span");
      var price = document.createElement("span");
      var status = document.createElement("span");
      var button = document.createElement("button");

      card.className = "shop-card" + (affordable ? "" : " is-unaffordable");
      card.setAttribute("data-item", item.id);

      art.className = "shop-card__art";
      art.setAttribute("aria-hidden", "true");
      art.innerHTML = decorArt(item.id);

      name.className = "shop-card__name";
      name.textContent = item.name;

      note.className = "shop-card__note";
      note.textContent = item.note;

      price.className = "shop-card__price";
      price.textContent = "🪙 " + item.price;

      status.className = "shop-card__status";
      status.textContent = owned ? "已购 " + owned + " 件 · 库存 " + inTray : "还没拥有";

      button.type = "button";
      button.className = "shop-card__buy";
      button.textContent = affordable ? "购买" : "金币不足";
      button.setAttribute(
        "aria-label",
        "购买" + item.name + "，价格 " + item.price + " 金币"
      );
      button.addEventListener("click", function () {
        buyDecorShopItem(item.id);
      });

      card.appendChild(art);
      card.appendChild(name);
      card.appendChild(note);
      card.appendChild(price);
      card.appendChild(status);
      card.appendChild(button);
      els.decorShopList.appendChild(card);
    });
  }

  function buyDecorShopItem(itemId) {
    if (activeMystery) {
      return;
    }

    var item = DECOR_SHOP_BY_ID[itemId];

    if (!item) {
      return;
    }

    if (state.decorItems.length >= MAX_DECOR_ITEMS) {
      setDecorShopFeedback("店里的装饰已经很多啦，先收纳一些再买吧～", "error");
      return;
    }

    if (state.coins < item.price) {
      setDecorShopFeedback(
        "金币还差 " + (item.price - state.coins) + " 枚，先完成几笔订单吧～",
        "error"
      );
      return;
    }

    state.coins = Math.max(0, state.coins - item.price);
    state.decorItems.push({
      uid: makeDecorUid(),
      type: itemId,
      x: null,
      y: null
    });
    saveState();
    renderStats();
    renderDecorShop();
    renderDecorTray();
    setDecorShopFeedback(
      "「" + item.name + "」已经放进装饰库存，可以在上方店里摆放啦～",
      "success"
    );
  }

  function renderDecorTray() {
    if (!els.decorTrayList) {
      return;
    }

    els.decorTrayList.textContent = "";

    var inventory = state.decorItems.filter(function (item) {
      return item.x === null;
    });

    if (!inventory.length) {
      var empty = document.createElement("li");
      empty.className = "decor-tray__empty";
      empty.textContent = "库存还空着，去下面的装饰商店挑一件吧～";
      els.decorTrayList.appendChild(empty);
    } else {
      inventory.forEach(function (item) {
        var def = DECOR_SHOP_BY_ID[item.type];

        if (!def) {
          return;
        }

        var wrapper = document.createElement("li");
        var button = document.createElement("button");
        var art = document.createElement("span");
        var label = document.createElement("span");
        var selected = pendingPlacementUid === item.uid;

        button.type = "button";
        button.className = "tray-item" + (selected ? " is-selected" : "");
        button.setAttribute("data-uid", item.uid);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        button.setAttribute("aria-label", (selected ? "取消摆放" : "选择") + def.name);

        art.className = "tray-item__art";
        art.setAttribute("aria-hidden", "true");
        art.innerHTML = decorArt(item.type);

        label.className = "tray-item__name";
        label.textContent = def.name;

        button.appendChild(art);
        button.appendChild(label);
        button.addEventListener("click", function () {
          togglePendingPlacement(item.uid);
        });

        wrapper.appendChild(button);
        els.decorTrayList.appendChild(wrapper);
      });
    }

    renderDecorActions();
    updateDecorTrayHint();
  }

  function updateDecorTrayHint() {
    if (!els.decorTrayHint) {
      return;
    }

    var pending = pendingPlacementUid ? findDecorItem(pendingPlacementUid) : null;
    var pendingDef = pending ? DECOR_SHOP_BY_ID[pending.type] : null;
    var selected = selectedPlacedUid ? findDecorItem(selectedPlacedUid) : null;
    var selectedDef = selected ? DECOR_SHOP_BY_ID[selected.type] : null;

    if (pendingDef) {
      els.decorTrayHint.textContent =
        "点一下店里的空位，放下「" + pendingDef.name + "」。";
    } else if (selectedDef) {
      els.decorTrayHint.textContent =
        "已选中「" +
        selectedDef.name +
        "」：拖动可以移动，点「收进库存」可以收回。";
    } else if (!state.decorItems.length) {
      els.decorTrayHint.textContent = "库存还空着，去下面的装饰商店挑一件吧～";
    } else {
      els.decorTrayHint.textContent =
        "点一下库存里的装饰，再点店内位置就能摆放。";
    }

    if (els.decorCancel) {
      if (pendingDef) {
        els.decorCancel.classList.remove("is-hidden");
      } else {
        els.decorCancel.classList.add("is-hidden");
      }
    }
  }

  function renderDecorActions() {
    if (!els.decorActions || !els.decorActionsName) {
      return;
    }

    var item = selectedPlacedUid ? findDecorItem(selectedPlacedUid) : null;
    var def = item ? DECOR_SHOP_BY_ID[item.type] : null;

    if (!item || !def || item.x === null) {
      els.decorActions.classList.add("is-hidden");
      return;
    }

    els.decorActions.classList.remove("is-hidden");
    els.decorActionsName.textContent = "已选中「" + def.name + "」";
  }

  function clampPlacedDecor(item, button) {
    if (!els.room || !button) {
      return;
    }

    var roomRect = els.room.getBoundingClientRect();
    var rect = button.getBoundingClientRect();

    if (!roomRect.width || !roomRect.height) {
      return;
    }

    var halfWidth = ((rect.width || 60) / 2 / roomRect.width) * 100;
    var halfHeight = ((rect.height || 60) / 2 / roomRect.height) * 100;

    if (halfWidth * 2 >= 100) {
      halfWidth = 50;
    }
    if (halfHeight * 2 >= 100) {
      halfHeight = 50;
    }

    var x = Math.min(100 - halfWidth, Math.max(halfWidth, item.x));
    var y = Math.min(100 - halfHeight, Math.max(halfHeight, item.y));

    item.x = x;
    item.y = y;
    button.style.left = x + "%";
    button.style.top = y + "%";
  }

  function renderPlacedDecor() {
    if (!els.decorLayer) {
      return;
    }

    els.decorLayer.textContent = "";

    state.decorItems.forEach(function (item) {
      if (item.x === null || item.y === null) {
        return;
      }

      var def = DECOR_SHOP_BY_ID[item.type];

      if (!def) {
        return;
      }

      var button = document.createElement("button");
      button.type = "button";
      button.className =
        "placed-decor" + (selectedPlacedUid === item.uid ? " is-selected" : "");
      button.setAttribute("data-type", item.type);
      button.setAttribute("data-uid", item.uid);
      button.setAttribute(
        "aria-label",
        "已摆放的" + def.name + "：拖动或用方向键移动，按删除键收进库存"
      );
      button.innerHTML = decorArt(item.type);
      button.style.left = item.x + "%";
      button.style.top = item.y + "%";

      els.decorLayer.appendChild(button);
      clampPlacedDecor(item, button);
      bindPlacedDecor(button, item);
    });

    renderDecorActions();
    updateDecorTrayHint();
  }

  function bindPlacedDecor(button, item) {
    button.addEventListener("pointerdown", function (event) {
      startDecorDrag(event, item, button);
    });
    button.addEventListener("pointermove", function (event) {
      moveDecorDrag(event);
    });
    button.addEventListener("pointerup", function (event) {
      endDecorDrag(event);
    });
    button.addEventListener("pointercancel", function (event) {
      endDecorDrag(event);
    });
    button.addEventListener("keydown", function (event) {
      handleDecorKeydown(event, item, button);
    });
  }

  function startDecorDrag(event, item, button) {
    if (pendingPlacementUid) {
      return;
    }

    if (typeof event.button === "number" && event.button !== 0) {
      return;
    }

    if (typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    if (!els.room) {
      return;
    }

    var rect = els.room.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    dragState = {
      item: item,
      button: button,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y,
      moved: false
    };

    if (
      typeof button.setPointerCapture === "function" &&
      event.pointerId !== undefined
    ) {
      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {
        // 不支持指针捕获时，仍可通过按钮自身的事件继续拖动。
      }
    }

    button.classList.add("is-dragging");
    selectPlacedDecor(item.uid);
  }

  function moveDecorDrag(event) {
    if (!dragState) {
      return;
    }

    if (
      event.pointerId !== undefined &&
      dragState.pointerId !== undefined &&
      event.pointerId !== dragState.pointerId
    ) {
      return;
    }

    var dx = event.clientX - dragState.startX;
    var dy = event.clientY - dragState.startY;

    if (!dragState.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) {
      return;
    }

    dragState.moved = true;

    var rect = els.room.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    dragState.item.x = dragState.originX + (dx / rect.width) * 100;
    dragState.item.y = dragState.originY + (dy / rect.height) * 100;
    clampPlacedDecor(dragState.item, dragState.button);
  }

  function endDecorDrag(event) {
    if (!dragState) {
      return;
    }

    var active = dragState;
    dragState = null;

    active.button.classList.remove("is-dragging");

    if (
      typeof active.button.releasePointerCapture === "function" &&
      active.pointerId !== undefined
    ) {
      try {
        active.button.releasePointerCapture(active.pointerId);
      } catch (error) {
        // 忽略释放捕获失败。
      }
    }

    if (active.moved) {
      saveState();
      var def = DECOR_SHOP_BY_ID[active.item.type];
      setDecorShopFeedback(
        "「" + (def ? def.name : "装饰") + "」的新位置已经记住啦～",
        "success"
      );
    }
  }

  function handleDecorKeydown(event, item, button) {
    var step = event.shiftKey ? 5 : 1;
    var dx = 0;
    var dy = 0;

    if (event.key === "ArrowLeft") {
      dx = -step;
    } else if (event.key === "ArrowRight") {
      dx = step;
    } else if (event.key === "ArrowUp") {
      dy = -step;
    } else if (event.key === "ArrowDown") {
      dy = step;
    }

    if (dx || dy) {
      event.preventDefault();
      item.x += dx;
      item.y += dy;
      clampPlacedDecor(item, button);
      saveState();
      selectPlacedDecor(item.uid);
      return;
    }

    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      selectPlacedDecor(item.uid);
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      selectedPlacedUid = item.uid;
      storeSelectedDecor();
    }
  }

  function selectPlacedDecor(uid) {
    selectedPlacedUid = uid;

    if (els.decorLayer) {
      var buttons = els.decorLayer.children;

      for (var i = 0; i < buttons.length; i += 1) {
        if (buttons[i].getAttribute("data-uid") === uid) {
          buttons[i].classList.add("is-selected");
        } else {
          buttons[i].classList.remove("is-selected");
        }
      }
    }

    renderDecorActions();
    updateDecorTrayHint();
  }

  function deselectPlacedDecor() {
    selectedPlacedUid = null;
    renderPlacedDecor();
  }

  function togglePendingPlacement(uid) {
    if (activeMystery) {
      return;
    }

    if (pendingPlacementUid === uid) {
      clearPendingPlacement();
      return;
    }

    var item = findDecorItem(uid);

    if (!item || item.x !== null) {
      return;
    }

    pendingPlacementUid = uid;
    selectedPlacedUid = null;
    renderPlacedDecor();
    renderDecorTray();

    if (els.room) {
      els.room.classList.add("is-placing");
    }
  }

  function clearPendingPlacement() {
    pendingPlacementUid = null;

    if (els.room) {
      els.room.classList.remove("is-placing");
    }

    renderPlacedDecor();
    renderDecorTray();
  }

  function placePendingDecor(event) {
    if (!pendingPlacementUid || !els.room) {
      return;
    }

    var item = findDecorItem(pendingPlacementUid);

    if (!item) {
      clearPendingPlacement();
      return;
    }

    var rect = els.room.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    item.x = ((event.clientX - rect.left) / rect.width) * 100;
    item.y = ((event.clientY - rect.top) / rect.height) * 100;
    pendingPlacementUid = null;

    els.room.classList.remove("is-placing");

    renderPlacedDecor();
    renderDecorTray();
    renderDecorShop();
    saveState();

    var def = DECOR_SHOP_BY_ID[item.type];
    setDecorShopFeedback(
      "「" + (def ? def.name : "装饰") + "」摆好啦，拖动它就能调整位置～",
      "success"
    );
  }

  function storeSelectedDecor() {
    var item = selectedPlacedUid ? findDecorItem(selectedPlacedUid) : null;

    if (!item || item.x === null) {
      return;
    }

    var def = DECOR_SHOP_BY_ID[item.type];
    item.x = null;
    item.y = null;
    selectedPlacedUid = null;
    saveState();
    renderPlacedDecor();
    renderDecorTray();
    renderDecorShop();
    setDecorShopFeedback(
      "「" + (def ? def.name : "装饰") + "」收进库存啦，随时可以再摆出来～",
      "success"
    );
  }

  function handleRoomClick(event) {
    if (!pendingPlacementUid) {
      return;
    }

    placePendingDecor(event);
  }

  function handleDecorKeydownGlobal(event) {
    if (event.key !== "Escape") {
      return;
    }

    if (pendingPlacementUid) {
      clearPendingPlacement();
    } else if (selectedPlacedUid) {
      deselectPlacedDecor();
    }
  }

  function handleDecorResize() {
    if (!state.decorItems.length) {
      return;
    }

    window.clearTimeout(decorResizeTimer);
    decorResizeTimer = window.setTimeout(function () {
      var placedBefore = state.decorItems
        .filter(function (item) {
          return item.x !== null;
        })
        .map(function (item) {
          return item.x + "," + item.y;
        })
        .join("|");

      renderPlacedDecor();

      var placedAfter = state.decorItems
        .filter(function (item) {
          return item.x !== null;
        })
        .map(function (item) {
          return item.x + "," + item.y;
        })
        .join("|");

      if (placedBefore !== placedAfter) {
        saveState();
      }
    }, 180);
  }

  // ---------- 三花猫店员「今」的状态与移动 ----------

  function catApplyPosition() {
    if (!cat.zone) {
      return;
    }

    cat.zone.style.left = cat.x + "%";
    cat.zone.style.top = CAT_FLOOR_Y + "%";

    if (cat.bubble && !cat.bubble.classList.contains("is-hidden")) {
      catPositionBubble();
    }
  }

  function catSetFacing(direction) {
    cat.facing = direction < 0 ? -1 : 1;

    if (cat.el) {
      cat.el.setAttribute("data-facing", String(cat.facing));
    }
  }

  function catSetState(stateName) {
    cat.state = stateName;

    if (cat.el) {
      cat.el.className = "cat is-" + stateName;
      cat.el.setAttribute("data-state", stateName);
    }
  }

  function catClearStateTimer() {
    window.clearTimeout(cat.stateTimer);
    cat.stateTimer = null;
  }

  function catEnterIdle(delay) {
    if (!cat.el) {
      return;
    }

    catClearStateTimer();
    catSetState("idle");
    cat.targetX = null;
    cat.idleRounds += 1;
    cat.stateTimer = window.setTimeout(catNextAction, delay || 2600);
  }

  function catNextAction() {
    if (!cat.el || cat.state !== "idle") {
      return;
    }

    var roll = Math.random();

    // 连续几轮待机之后，才有机会趴下休息。
    if (cat.idleRounds >= 3 && roll < 0.42) {
      catRest();
      return;
    }

    if (roll < 0.74) {
      catWalk();
      return;
    }

    catEnterIdle(2400 + Math.random() * 2600);
  }

  function catWalk() {
    if (!cat.el) {
      return;
    }

    catClearStateTimer();
    cat.idleRounds = 0;
    catSetState("walking");

    var target = CAT_MIN_X + Math.random() * (CAT_MAX_X - CAT_MIN_X);

    if (Math.abs(target - cat.x) < 12) {
      target = cat.x > (CAT_MIN_X + CAT_MAX_X) / 2 ? CAT_MIN_X + 4 : CAT_MAX_X - 4;
    }

    cat.targetX = Math.min(CAT_MAX_X, Math.max(CAT_MIN_X, target));
    catSetFacing(cat.targetX >= cat.x ? 1 : -1);

    cat.stateTimer = window.setTimeout(function () {
      if (cat.state === "walking") {
        catEnterIdle(1600 + Math.random() * 1600);
      }
    }, 7000);
  }

  function catRest() {
    if (!cat.el) {
      return;
    }

    catClearStateTimer();
    cat.idleRounds = 0;
    catSetState("resting");
    cat.targetX = null;

    cat.stateTimer = window.setTimeout(function () {
      if (cat.state === "resting") {
        catEnterIdle(1800);
      }
    }, 9000 + Math.random() * 4000);
  }

  function catWork() {
    if (!cat.el) {
      return;
    }

    catClearStateTimer();
    cat.idleRounds = 0;
    catSetState("working");
    catSetFacing(CAT_WORK_X >= cat.x ? 1 : -1);
    cat.targetX = CAT_WORK_X;

    cat.stateTimer = window.setTimeout(function () {
      if (cat.state === "working") {
        catEnterIdle(1400);
      }
    }, 3200);
  }

  function catAdvance(seconds) {
    if (!cat.zone || cat.targetX === null) {
      return;
    }

    var target = Math.min(CAT_MAX_X, Math.max(CAT_MIN_X, cat.targetX));
    var dx = target - cat.x;
    var step = CAT_SPEED * seconds;

    if (Math.abs(dx) <= step) {
      cat.x = target;
      cat.targetX = null;
      catApplyPosition();

      if (cat.state === "working") {
        catSetFacing(1);
      }

      if (cat.state === "walking") {
        catEnterIdle(1400 + Math.random() * 1600);
      }
      return;
    }

    cat.x += dx > 0 ? step : -step;
    cat.x = Math.min(CAT_MAX_X, Math.max(CAT_MIN_X, cat.x));
    catSetFacing(dx);
    catApplyPosition();
  }

  function catLoop() {
    var now = Date.now();

    if (!cat.lastTick) {
      cat.lastTick = now;
    }

    var dt = Math.min(0.25, (now - cat.lastTick) / 1000);
    cat.lastTick = now;
    catAdvance(dt);

    cat.loopTimer = window.setTimeout(catLoop, 40);
  }

  function catPositionBubble() {
    if (!cat.bubble || !cat.zone || !els.room) {
      return;
    }

    var roomRect = els.room.getBoundingClientRect();
    var zoneRect = cat.zone.getBoundingClientRect();

    if (!roomRect.width || !roomRect.height || !zoneRect.height) {
      cat.bubble.style.left = cat.x + "%";
      cat.bubble.style.top = (CAT_FLOOR_Y - 22) + "%";      return;
    }

    cat.bubble.style.left =
      ((zoneRect.left + zoneRect.width / 2 - roomRect.left) / roomRect.width) * 100 + "%";
    cat.bubble.style.top =
      ((zoneRect.top - roomRect.top - 6) / roomRect.height) * 100 + "%";
  }

  function showCatDialogue() {
    if (!cat.bubble) {
      return;
    }

    var line = CAT_LINES[Math.floor(Math.random() * CAT_LINES.length)];

    cat.bubble.textContent = line;
    cat.bubble.classList.remove("is-hidden");
    catPositionBubble();
    cat.idleRounds = 0;

    window.clearTimeout(cat.bubbleTimer);
    cat.bubbleTimer = window.setTimeout(function () {
      if (cat.bubble) {
        cat.bubble.classList.add("is-hidden");
      }
    }, 3000);
  }

  function handleCatClick(event) {
    if (pendingPlacementUid || activeMystery) {
      return;
    }

    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    showCatDialogue();
  }

  function initCat() {
    cat.zone = document.getElementById("cat-zone");
    cat.el = document.getElementById("cat");
    cat.bubble = document.getElementById("cat-bubble");

    if (!cat.zone || !cat.el) {
      return;
    }

    catApplyPosition();
    catSetFacing(-1);
    cat.el.addEventListener("click", handleCatClick);
    catEnterIdle(1400);
    catLoop();
  }

  function catReset() {
    if (!cat.el) {
      return;
    }

    catClearStateTimer();
    window.clearTimeout(cat.bubbleTimer);

    if (cat.bubble) {
      cat.bubble.classList.add("is-hidden");
    }

    cat.x = 74;
    cat.targetX = null;
    cat.idleRounds = 0;
    catApplyPosition();
    catSetFacing(-1);
    catEnterIdle(1200);
  }

  function catOnOrderDone() {
    // 猫咪只是表现层：即使动画逻辑异常，也不影响订单结算。
    try {
      catWork();
    } catch (error) {
      // 忽略猫咪状态切换失败。
    }
  }

  function setFeedback(message, tone) {
    if (!els.feedback) {
      return;
    }

    els.feedback.textContent = message;
    els.feedback.classList.remove("is-success", "is-error");

    if (tone === "success") {
      els.feedback.classList.add("is-success");
    } else if (tone === "error") {
      els.feedback.classList.add("is-error");
    }
  }

  function setDecorFeedback(message, tone) {
    if (!els.decorFeedback) {
      return;
    }

    els.decorFeedback.textContent = message;
    els.decorFeedback.classList.remove("is-success", "is-error");

    if (tone === "success") {
      els.decorFeedback.classList.add("is-success");
    } else if (tone === "error") {
      els.decorFeedback.classList.add("is-error");
    }
  }

  function renderOrder() {
    var order = state.order;

    if (!order) {
      return;
    }

    var product = PRODUCT_BY_ID[order.productId];
    var customer = order.customer;
    var serial = ("00" + order.serial).slice(-3);

    if (!product || !customer) {
      return;
    }

    if (els.orderNo) {
      els.orderNo.textContent = "NO. " + serial;
    }
    if (els.orderAvatar) {
      els.orderAvatar.textContent = customer.avatar;
    }
    if (els.orderCustomer) {
      els.orderCustomer.textContent = customer.name;
    }
    if (els.orderSpeech) {
      els.orderSpeech.textContent =
        "“" + customer.hello + "请给我一份「" + product.shortName + "」～”";
    }
    if (els.orderThumb) {
      els.orderThumb.textContent = product.emoji;
    }
    if (els.orderProduct) {
      els.orderProduct.textContent = product.name;
    }
    if (els.orderNote) {
      els.orderNote.textContent = product.note;
    }
    if (els.orderReward) {
      els.orderReward.textContent = "🪙 +" + product.reward;
    }

    if (els.sceneGuestAvatar) {
      els.sceneGuestAvatar.textContent = customer.avatar;
    }
    if (els.sceneGuestHello) {
      els.sceneGuestHello.textContent = customer.hello;
    }
    if (els.sceneProduct) {
      els.sceneProduct.textContent = product.shortName;
    }
    if (els.sceneCup) {
      els.sceneCup.textContent = product.emoji;
    }
    if (els.room) {
      els.room.setAttribute(
        "aria-label",
        "午后咖啡馆内，" +
          customer.name +
          "坐在圆桌旁，想点一份" +
          product.shortName +
          "；吧台后是店员、甜点柜和热咖啡。"
      );
    }

    setFeedback("点一下菜单里的「" + product.name + "」，为客人制作吧～", "idle");
  }

  function createOrder() {
    if (activeMystery) {
      return;
    }

    var product = pick(PRODUCTS);
    var customer = pick(CUSTOMERS);

    state.orderNo = Math.min(MAX_VALUE, state.orderNo + 1);
    state.order = {
      serial: state.orderNo,
      productId: product.id,
      customer: customer,
      completed: false
    };

    renderOrder();
  }

  function buyDecoration(decorId) {
    if (activeMystery) {
      return;
    }

    var decor = DECOR_BY_ID[decorId];

    if (!decor) {
      return;
    }

    if (isOwned(decorId)) {
      setDecorFeedback("这件装饰已经在店里啦～", "idle");
      return;
    }

    if (state.coins < decor.price) {
      setDecorFeedback(
        "金币还差 " + (decor.price - state.coins) + " 枚，再招待几位客人吧～",
        "error"
      );
      return;
    }

    state.coins = Math.max(0, state.coins - decor.price);
    state.owned.push(decorId);
    saveState();
    renderStats();
    renderDecorShop();
    renderDecor();
    renderRoomDecor();
    setDecorFeedback(
      "「" + decor.name + "」已经摆进店里啦，金币 -" + decor.price + "～",
      "success"
    );
  }

  function submitProduct(productId) {
    if (activeMystery) {
      return;
    }

    var order = state.order;

    if (!order) {
      return;
    }

    var chosen = PRODUCT_BY_ID[productId];
    var wanted = PRODUCT_BY_ID[order.productId];

    if (!chosen || !wanted) {
      return;
    }

    // 同一订单只结算一次；成功后的短暂停留期内再次点击不会重复领奖。
    if (order.completed) {
      setFeedback("这一单已经完成啦，下一位客人马上就到～", "idle");
      return;
    }

    if (chosen.id !== wanted.id) {
      setFeedback("咦，客人想要的是「" + wanted.name + "」哦，再试一次吧～", "error");
      return;
    }

    order.completed = true;
    state.normalOrders = Math.min(MAX_VALUE, state.normalOrders + 1);
    state.coins = Math.min(MAX_VALUE, state.coins + wanted.reward);
    state.reviews = Math.min(MAX_VALUE, state.reviews + 1);
    saveState();
    renderStats();
    renderDecorShop();
    catOnOrderDone();

    setFeedback(
      "叮——" + wanted.shortName + "完成啦！🪙 +" + wanted.reward + "，好评 +1 ♡",
      "success"
    );

    if (els.orderSpeech) {
      els.orderSpeech.textContent = "“谢谢店长，闻起来好香呀～”";
    }

    window.clearTimeout(nextCustomerTimer);
    nextCustomerTimer = null;

    if (state.normalOrders >= state.nextMysteryAt) {
      openMysteryEvent();
    } else {
      nextCustomerTimer = window.setTimeout(createOrder, 1400);
    }
  }

  function findQuestionById(questionId) {
    var questions = getActiveQuestions();

    for (var i = 0; i < questions.length; i += 1) {
      if (questions[i].id === questionId) {
        return questions[i];
      }
    }

    return null;
  }

  function findMysteryCustomerById(customerId) {
    for (var i = 0; i < MYSTERY_CUSTOMERS.length; i += 1) {
      if (MYSTERY_CUSTOMERS[i].id === customerId) {
        return MYSTERY_CUSTOMERS[i];
      }
    }

    return null;
  }

  function makeMysteryEventId() {
    return (
      "q" +
      Date.now().toString(36) +
      "-" +
      Math.floor(Math.random() * 1000000).toString(36)
    );
  }

  function normalizeOrderSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      return null;
    }

    var product = PRODUCT_BY_ID[snapshot.productId];
    var customer = snapshot.customer;

    if (
      !product ||
      !customer ||
      typeof customer.name !== "string" ||
      !customer.name ||
      typeof customer.avatar !== "string" ||
      typeof customer.hello !== "string"
    ) {
      return null;
    }

    return {
      serial: sanitizeInteger(snapshot.serial, 0),
      productId: product.id,
      customer: {
        name: customer.name,
        avatar: customer.avatar,
        hello: customer.hello
      },
      completed: true
    };
  }

  function mysteryOptionsFromOrder(optionOrder, question) {
    if (!Array.isArray(optionOrder) || optionOrder.length !== 4) {
      return null;
    }

    var provided = optionOrder.slice();
    var expected = question.options.slice();

    for (var i = 0; i < provided.length; i += 1) {
      if (typeof provided[i] !== "string" || !provided[i].trim()) {
        return null;
      }
    }

    if (
      provided.slice().sort().join("\u0000") !==
      expected.slice().sort().join("\u0000")
    ) {
      return null;
    }

    return provided.map(function (text) {
      return {
        text: text,
        isCorrect: text === question.answer
      };
    });
  }

  function hasQuizEvent(eventId) {
    return state.quizHistory.some(function (record) {
      return record.eventId === eventId;
    });
  }

  function appendQuizHistory(record) {
    state.quizHistory.push(record);

    if (state.quizHistory.length > QUIZ_HISTORY_LIMIT) {
      state.quizHistory = state.quizHistory.slice(-QUIZ_HISTORY_LIMIT);
    }
  }

  function renderMysteryEvent() {
    if (
      !activeMystery ||
      !els.mysteryOverlay ||
      !els.mysteryOptions ||
      !els.mysteryQuestionText ||
      !els.mysteryResult ||
      !els.mysteryNext
    ) {
      return false;
    }

    var question = findQuestionById(activeMystery.questionId);
    var customer = findMysteryCustomerById(activeMystery.customerId);

    if (!question || !customer) {
      return false;
    }

    var options = mysteryOptionsFromOrder(activeMystery.optionOrder, question);

    if (!options) {
      return false;
    }

    if (els.mysteryAvatar) {
      els.mysteryAvatar.textContent = customer.avatar;
    }
    if (els.mysteryCustomer) {
      els.mysteryCustomer.textContent = customer.name;
    }
    if (els.mysteryDialogue) {
      els.mysteryDialogue.textContent = "“" + customer.line + "”";
    }

    els.mysteryQuestionText.textContent = question.question;
    els.mysteryOptions.textContent = "";
    els.mysteryResult.textContent = "";
    els.mysteryResult.classList.remove("is-success", "is-error");

    options.forEach(function (option, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "mystery-option";
      button.setAttribute("data-answer", option.text);
      button.disabled = activeMystery.answered;

      if (activeMystery.answered) {
        if (option.text === question.answer) {
          button.classList.add("is-correct");
        } else if (option.text === activeMystery.selectedText) {
          button.classList.add("is-wrong");
        }
      } else {
        button.addEventListener("click", function () {
          answerMystery(option.text);
        });
      }

      var letter = document.createElement("span");
      letter.className = "mystery-option__letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = String.fromCharCode(65 + index);

      var text = document.createElement("span");
      text.className = "mystery-option__text";
      text.textContent = option.text;

      button.appendChild(letter);
      button.appendChild(text);
      els.mysteryOptions.appendChild(button);
    });

    if (activeMystery.answered) {
      els.mysteryResult.textContent =
        activeMystery.resultMessage || "这一题已经回答过啦，继续营业吧～";
      els.mysteryResult.classList.add(
        activeMystery.resultTone === "success" ? "is-success" : "is-error"
      );
      els.mysteryNext.classList.remove("is-hidden");
    } else {
      els.mysteryNext.classList.add("is-hidden");
    }

    els.mysteryOverlay.classList.add("is-open");
    els.mysteryOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-mystery");

    if (activeMystery.answered) {
      els.mysteryNext.focus();
    } else if (els.mysteryOptions.children[0]) {
      els.mysteryOptions.children[0].focus();
    }

    return true;
  }

  function openMysteryEvent() {
    if (activeMystery) {
      return;
    }

    var questions = getActiveQuestions();
    var orderSnapshot = normalizeOrderSnapshot(state.order);

    if (
      !questions.length ||
      !orderSnapshot ||
      !els.mysteryOverlay ||
      !els.mysteryOptions ||
      !els.mysteryQuestionText ||
      !els.mysteryResult ||
      !els.mysteryNext
    ) {
      scheduleNextMystery();
      saveState();
      createOrder();
      return;
    }

    var customer = pick(MYSTERY_CUSTOMERS);
    var question = pick(questions);
    var optionOrder = shuffle(question.options.slice());

    activeMystery = {
      eventId: makeMysteryEventId(),
      questionId: question.id,
      customerId: customer.id,
      optionOrder: optionOrder,
      order: orderSnapshot,
      answered: false,
      correct: false,
      selectedText: "",
      rewardClaimed: false,
      rewardType: "",
      rewardAmount: 0,
      rewardItemId: "",
      resultMessage: "",
      resultTone: "",
      startedAt: new Date().toISOString()
    };
    lastFocused = document.activeElement;

    saveState();

    if (!renderMysteryEvent()) {
      activeMystery = null;
      scheduleNextMystery();
      saveState();
      createOrder();
    }
  }

  function grantMysteryReward() {
    var roll = Math.random() * 100;

    if (roll < REWARD_COIN_RATE) {
      var amount =
        QUIZ_REWARD_MIN +
        Math.floor(Math.random() * (QUIZ_REWARD_MAX - QUIZ_REWARD_MIN + 1));
      state.coins = Math.min(MAX_VALUE, state.coins + amount);
      renderStats();
      renderDecorShop();
      return {
        message: "答对啦！神秘顾客留下了 🪙 " + amount + " 金币。",
        rewardType: "coins",
        rewardAmount: amount,
        rewardItemId: ""
      };
    }

    var isLimited = roll < REWARD_COIN_RATE + REWARD_DECOR_RATE;
    var item = pick(isLimited ? LIMITED_DECORATIONS : RARE_COLLECTIBLES);

    if (hasCollected(item.id)) {
      state.coins = Math.min(MAX_VALUE, state.coins + DUPLICATE_COMPENSATION);
      renderStats();
      renderDecorShop();
      return {
        message:
          "又抽到了「" +
          item.name +
          "」～它已经在收藏里啦，换成 🪙 " +
          DUPLICATE_COMPENSATION +
          " 补偿。",
        rewardType: "duplicate",
        rewardAmount: DUPLICATE_COMPENSATION,
        rewardItemId: item.id
      };
    }

    state.collected[item.id] = {
      at: new Date().toISOString()
    };
    renderCollection();
    renderLimitedShelf();

    return {
      message:
        "答对啦！获得" +
        (isLimited ? "限定装饰" : "稀有收藏") +
        "「" +
        item.name +
        "」！",
      rewardType: isLimited ? "decoration" : "collectible",
      rewardAmount: 0,
      rewardItemId: item.id
    };
  }

  function answerMystery(selectedText) {
    if (!activeMystery || activeMystery.answered) {
      return;
    }

    if (hasQuizEvent(activeMystery.eventId)) {
      return;
    }

    var question = findQuestionById(activeMystery.questionId);

    if (
      !question ||
      !Array.isArray(activeMystery.optionOrder) ||
      activeMystery.optionOrder.indexOf(selectedText) === -1
    ) {
      return;
    }

    activeMystery.answered = true;
    activeMystery.selectedText = selectedText;
    activeMystery.correct = selectedText === question.answer;

    if (activeMystery.correct) {
      var reward = grantMysteryReward();
      activeMystery.rewardClaimed = true;
      activeMystery.rewardType = reward.rewardType;
      activeMystery.rewardAmount = reward.rewardAmount;
      activeMystery.rewardItemId = reward.rewardItemId;
      activeMystery.resultMessage = reward.message;
      activeMystery.resultTone = "success";
    } else {
      activeMystery.rewardClaimed = false;
      activeMystery.rewardType = "none";
      activeMystery.rewardAmount = 0;
      activeMystery.rewardItemId = "";
      activeMystery.resultMessage =
        "没关系～正确答案是「" + question.answer + "」。这次不扣金币，下次再来～";
      activeMystery.resultTone = "error";
    }

    appendQuizHistory({
      eventId: activeMystery.eventId,
      questionId: activeMystery.questionId,
      correct: activeMystery.correct,
      selectedText: activeMystery.selectedText,
      rewardType: activeMystery.rewardType,
      rewardAmount: activeMystery.rewardAmount,
      itemId: activeMystery.rewardItemId,
      at: new Date().toISOString()
    });

    scheduleNextMystery();
    saveState();
    renderMysteryEvent();
  }

  function restoreMysteryEvent(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return false;
    }

    var eventId = typeof raw.eventId === "string" ? raw.eventId : "";
    var question = findQuestionById(raw.questionId);
    var customer = findMysteryCustomerById(raw.customerId);
    var order = normalizeOrderSnapshot(raw.order);

    if (!eventId || !question || !customer || !order) {
      return false;
    }

    var options = mysteryOptionsFromOrder(raw.optionOrder, question);

    if (!options) {
      return false;
    }

    var answered = raw.answered === true;
    var selectedText = typeof raw.selectedText === "string" ? raw.selectedText : "";
    var correct = answered && selectedText === question.answer;
    var rewardClaimed = raw.rewardClaimed === true;

    if (answered) {
      if (
        options.every(function (option) {
          return option.text !== selectedText;
        })
      ) {
        return false;
      }

      if (raw.correct === true && !correct) {
        return false;
      }
      if (raw.correct === false && correct) {
        return false;
      }

      if (correct && !rewardClaimed) {
        return false;
      }
      if (!correct && rewardClaimed) {
        return false;
      }
    } else {
      if (selectedText || correct || rewardClaimed || hasQuizEvent(eventId)) {
        return false;
      }
    }

    var resultMessage =
      typeof raw.resultMessage === "string" ? raw.resultMessage : "";
    var resultTone = correct ? "success" : "error";

    if (answered && !resultMessage) {
      resultMessage = "这一题已经回答过啦，继续营业吧～";
    }
    if (!answered) {
      resultMessage = "";
      resultTone = "";
    }

    activeMystery = {
      eventId: eventId,
      questionId: question.id,
      customerId: customer.id,
      optionOrder: options.map(function (option) {
        return option.text;
      }),
      order: order,
      answered: answered,
      correct: correct,
      selectedText: answered ? selectedText : "",
      rewardClaimed: answered ? rewardClaimed : false,
      rewardType: typeof raw.rewardType === "string" ? raw.rewardType : "",
      rewardAmount: sanitizeInteger(raw.rewardAmount, 0),
      rewardItemId: typeof raw.rewardItemId === "string" ? raw.rewardItemId : "",
      resultMessage: resultMessage,
      resultTone: resultTone,
      startedAt: typeof raw.startedAt === "string" ? raw.startedAt : ""
    };

    lastFocused = document.activeElement;
    state.order = order;
    renderOrder();

    if (!renderMysteryEvent()) {
      activeMystery = null;
      state.order = null;
      lastFocused = null;
      return false;
    }

    return true;
  }

  function closeMysteryEvent() {
    if (!activeMystery || !activeMystery.answered) {
      return;
    }

    els.mysteryOverlay.classList.remove("is-open");
    els.mysteryOverlay.setAttribute("aria-hidden", "true");
    els.mysteryNext.classList.add("is-hidden");
    document.body.classList.remove("has-mystery");

    activeMystery = null;
    saveState();

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
    lastFocused = null;

    createOrder();
  }

  function resetSave() {
    if (activeMystery) {
      return;
    }

    var confirmed = false;

    if (typeof window.confirm === "function") {
      try {
        confirmed = window.confirm(
          "确定要重置存档吗？金币、好评和已购买的装饰都会回到初始状态。"
        );
      } catch (error) {
        confirmed = false;
      }
    }

    if (!confirmed) {
      setDecorFeedback("已取消重置，小店继续营业～", "idle");
      return;
    }

    window.clearTimeout(nextCustomerTimer);
    nextCustomerTimer = null;

    state.coins = INITIAL_COINS;
    state.reviews = 0;
    state.owned = [];
    state.collected = {};
    state.quizHistory = [];
    state.orderNo = 0;
    state.normalOrders = 0;
    state.mysteryInterval = randomMysteryInterval();
    state.nextMysteryAt = state.mysteryInterval;
    state.order = null;
    state.decorItems = [];
    activeMystery = null;
    lastFocused = null;
    pendingPlacementUid = null;
    selectedPlacedUid = null;
    dragState = null;

    if (els.room) {
      els.room.classList.remove("is-placing");
    }

    clearSave();
    renderStats();
    renderDecor();
    renderRoomDecor();
    renderCollection();
    renderLimitedShelf();
    renderDecorShop();
    renderDecorTray();
    renderPlacedDecor();
    catReset();
    createOrder();
    setDecorShopFeedback("存档已重置，装饰也回到初始状态啦～", "idle");
    setDecorFeedback("存档已重置，金币、好评和装饰都回到初始状态啦～", "success");
  }

  function init() {
    els.coins = document.getElementById("coins");
    els.reviews = document.getElementById("reviews");
    els.menuList = document.getElementById("menu-list");
    els.feedback = document.getElementById("feedback");
    els.orderNo = document.getElementById("order-no");
    els.orderAvatar = document.getElementById("order-avatar");
    els.orderCustomer = document.getElementById("order-customer");
    els.orderSpeech = document.getElementById("order-speech");
    els.orderThumb = document.getElementById("order-thumb");
    els.orderProduct = document.getElementById("order-product");
    els.orderNote = document.getElementById("order-note");
    els.orderReward = document.getElementById("order-reward");
    els.room = document.getElementById("cafe-room");
    els.sceneGuestAvatar = document.getElementById("scene-guest-avatar");
    els.sceneGuestHello = document.getElementById("scene-guest-hello");
    els.sceneProduct = document.getElementById("scene-product");
    els.sceneCup = document.getElementById("scene-cup");
    els.decorList = document.getElementById("decor-list");
    els.decorFeedback = document.getElementById("decor-feedback");
    els.resetButton = document.getElementById("reset-save");
    els.shopPlant = document.getElementById("shop-plant");
    els.shopBouquet = document.getElementById("shop-bouquet");
    els.shopLamp = document.getElementById("shop-lamp");
    els.mysteryOverlay = document.getElementById("mystery-overlay");
    els.mysteryAvatar = document.getElementById("mystery-avatar");
    els.mysteryCustomer = document.getElementById("mystery-customer");
    els.mysteryDialogue = document.getElementById("mystery-dialogue");
    els.mysteryQuestionText = document.getElementById("mystery-question-text");
    els.mysteryOptions = document.getElementById("mystery-options");
    els.mysteryResult = document.getElementById("mystery-result");
    els.mysteryNext = document.getElementById("mystery-next");
    els.limitedShelf = document.getElementById("limited-shelf");
    els.limitedShelfItems = document.getElementById("limited-shelf-items");
    els.cabinetDecor = document.getElementById("cabinet-decor");
    els.cabinetRare = document.getElementById("cabinet-rare");
    els.cabinetCount = document.getElementById("cabinet-count");
    els.decorShopList = document.getElementById("decor-shop-list");
    els.decorShopFeedback = document.getElementById("decor-shop-feedback");
    els.decorTray = document.getElementById("decor-tray");
    els.decorTrayList = document.getElementById("decor-tray-list");
    els.decorTrayHint = document.getElementById("decor-tray-hint");
    els.decorCancel = document.getElementById("decor-cancel");
    els.decorActions = document.getElementById("decor-actions");
    els.decorActionsName = document.getElementById("decor-actions-name");
    els.decorStore = document.getElementById("decor-store");
    els.decorDeselect = document.getElementById("decor-deselect");
    els.decorLayer = document.getElementById("decor-layer");

    var year = document.getElementById("year");
    if (year) {
      year.textContent = new Date().getFullYear();
    }

    var saved = loadState();
    state.coins = saved.coins;
    state.reviews = saved.reviews;
    state.owned = saved.owned;
    state.collected = saved.collected;
    state.quizHistory = saved.quizHistory;
    state.orderNo = saved.orderNo;
    state.normalOrders = saved.normalOrders;
    state.mysteryInterval = saved.mysteryInterval;
    state.nextMysteryAt = saved.nextMysteryAt;
    state.decorItems = saved.decorItems;

    normalizeMysterySchedule();

    renderStats();
    renderMenu();
    renderDecor();
    renderRoomDecor();
    renderCollection();
    renderLimitedShelf();
    renderDecorShop();
    renderDecorTray();
    renderPlacedDecor();
    initCat();

    if (els.resetButton) {
      els.resetButton.addEventListener("click", resetSave);
    }
    if (els.mysteryNext) {
      els.mysteryNext.addEventListener("click", closeMysteryEvent);
    }
    if (els.decorCancel) {
      els.decorCancel.addEventListener("click", clearPendingPlacement);
    }
    if (els.decorStore) {
      els.decorStore.addEventListener("click", storeSelectedDecor);
    }
    if (els.decorDeselect) {
      els.decorDeselect.addEventListener("click", deselectPlacedDecor);
    }
    if (els.room) {
      els.room.addEventListener("click", handleRoomClick);
    }
    document.addEventListener("keydown", handleDecorKeydownGlobal);
    window.addEventListener("resize", handleDecorResize);

    var restoredMystery = false;

    if (saved.mystery) {
      try {
        restoredMystery = restoreMysteryEvent(saved.mystery);
      } catch (error) {
        restoredMystery = false;
        activeMystery = null;
        state.order = null;
      }
    }

    if (!restoredMystery) {
      activeMystery = null;
      state.order = null;

      if (saved.mystery) {
        saveState();
      }

      createOrder();
    }

    setDecorFeedback("进度会自动保存在这台设备上。", "idle");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
