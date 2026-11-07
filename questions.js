/* ============================================================
   木山今咖啡馆 · 神秘顾客题库
   只使用现有个人主页中已经公开的信息。
   status: "active" 且 confirmed: true 的题目才会进入抽题池；
   未确认的题目保持 status: "todo"、confirmed: false，不会参与抽题。
   修改时：补全 4 个选项和 answer，再把 status 改为 "active"。
   ============================================================ */

window.CAFE_QUIZ_DATA = {
  questions: [
    {
      id: "study-field",
      status: "active",
      confirmed: true,
      question: "店主在个人主页里写的学习方向是？",
      options: ["计算机", "金融学", "临床医学", "建筑学"],
      answer: "计算机",
      source: "现有个人主页 · 学习方向"
    },
    {
      id: "home-city",
      status: "active",
      confirmed: true,
      question: "店主的个人主页把坐标写在哪座城市？",
      options: ["青岛", "成都", "杭州", "厦门"],
      answer: "青岛",
      source: "现有个人主页 · 坐标"
    },
    {
      id: "study-notes",
      status: "active",
      confirmed: true,
      question: "店主整理过哪一门课的学习笔记？",
      options: ["线性代数", "大学物理", "中国近代史", "有机化学"],
      answer: "线性代数",
      source: "现有个人主页 · 作品「线性代数学习笔记」"
    },
    {
      id: "photo-theme",
      status: "active",
      confirmed: true,
      question: "店主的摄影作品《自然与风景》主要记录什么？",
      options: ["风景与自然光影", "城市建筑", "舞台演出", "美食特写"],
      answer: "风景与自然光影",
      source: "现有个人主页 · 作品说明"
    },
    {
      id: "todo-favorite-coffee",
      status: "todo",
      confirmed: false,
      question: "店主最喜欢的一款咖啡是？",
      options: ["小黄油拿铁","小黄油美式","生椰美式","店主不喜欢咖啡"],
      answer: "小黄油美式",
      source: "了解"
    },
    {
      id: "todo-cafe-idea",
      status: "todo",
      confirmed: false,
      question: "店主开这家咖啡馆的灵感来自？",
      options: ["无","爱喝咖啡","喜欢美食","纯无聊"],
      answer: "无",
      source: "了解"
    },
    {
      id: "todo-greeting",
      status: "todo",
      confirmed: false,
      question: "店主最想对客人说的一句话是？",
      options: ["少吃点","多吃点","吃很多","行"],
      answer: "行",
      source: "了解"
    },
    {
      id: "todo-like",
      status: "todo",
      confirmed: false,
      question: "最近店主爱吃什么？",
      options: ["盒饭","甜品","很多东西","肉"],
      answer: "肉",
      source: "了解"
    }

  ]
};
