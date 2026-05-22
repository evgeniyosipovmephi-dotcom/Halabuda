const db = new Dexie('Halabuda');

db.version(1).stores({
  drawers:  'id, name',
  items:    '++id, name',
  stock:    '++id, item_id, drawer_id, [item_id+drawer_id]',
  history:  '++id, timestamp, drawer_id, item_id'
});

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_DRAWERS = [
  { id: 1,  name: "Крепления дронов" },
  { id: 2,  name: "Крепления дронов" },
  { id: 3,  name: "Инструмент" },
  { id: 4,  name: "Пустой" },
  { id: 5,  name: "Электрика 220в" },
  { id: 6,  name: "Электроинструмент" },
  { id: 7,  name: "Слаботочка" },
  { id: 8,  name: "Ethernet" },
  { id: 9,  name: "Разное" },
  { id: 10, name: "Измерительные приборы" },
  { id: 11, name: "Клей / стяжки" },
  { id: 12, name: "Зарядки / провода" },
  { id: 13, name: "Выносной инструмент" },
  { id: 14, name: "Метизы" },
  { id: 15, name: "Пустой" },
  { id: 16, name: "Паячный" },
  { id: 17, name: "Наземка" },
  { id: 18, name: "Связь" },
  { id: 19, name: "Вода" },
  { id: 20, name: "Вода" },
  { id: 21, name: "Вода" },
  { id: 22, name: "Вода" },
  { id: 23, name: "Весы / хоз. отдел" },
  { id: 24, name: "Закусочная" },
  { id: 25, name: "Кальянная" }
];

// { id, name, min_stock, warn_coef }
const SEED_ITEMS = [
  // Ящик 1 — Крепления дронов
  { id: 1,  name: "Проставки между дронами",      min_stock: 0, warn_coef: 1.5 },
  // Ящик 2 — Крепления дронов
  { id: 2,  name: "Подсумки для дронов",           min_stock: 0, warn_coef: 1.5 },
  // Ящик 3 — Инструмент
  { id: 3,  name: "Пассатижи",                     min_stock: 1, warn_coef: 1.5 },
  { id: 4,  name: "Отвёртка крест. Б",             min_stock: 1, warn_coef: 2   },
  { id: 5,  name: "Отвёртка крест. С",             min_stock: 1, warn_coef: 2   },
  { id: 6,  name: "Отвёртка крест. М",             min_stock: 1, warn_coef: 2   },
  { id: 7,  name: "Отвёртка шлиц. Б",             min_stock: 1, warn_coef: 2   },
  { id: 8,  name: "Отвёртка шлиц. С",             min_stock: 1, warn_coef: 2   },
  { id: 9,  name: "Отвёртка шлиц. М",             min_stock: 1, warn_coef: 2   },
  { id: 10, name: "Отвёртка HEX 1.5мм",           min_stock: 1, warn_coef: 1.5 },
  { id: 11, name: "Отвёртка HEX 2мм",             min_stock: 1, warn_coef: 1.5 },
  { id: 12, name: "Отвёртка HEX 2.5мм",           min_stock: 1, warn_coef: 1.5 },
  { id: 13, name: "Отвёртка HEX 3мм",             min_stock: 1, warn_coef: 1.5 },
  { id: 14, name: "Нож канцелярский",              min_stock: 1, warn_coef: 1.5 },
  { id: 15, name: "Бокорезы",                      min_stock: 1, warn_coef: 1.5 },
  { id: 16, name: "Узкогубцы",                     min_stock: 1, warn_coef: 1.5 },
  { id: 17, name: "Ключ для пропов",               min_stock: 1, warn_coef: 1.5 },
  { id: 18, name: "Пила",                          min_stock: 1, warn_coef: 1.5 },
  // Ящик 5 — Электрика 220в
  { id: 19, name: "Удлинитель 220в ~5м",           min_stock: 1, warn_coef: 1.5 },
  { id: 20, name: "Кабель 3-жильный 2м",           min_stock: 0, warn_coef: 1.5 },
  { id: 21, name: "Клипсы для гофры 25мм",         min_stock: 2, warn_coef: 2   },
  // Ящик 6 — Электроинструмент
  { id: 22, name: "Воздуходувка Deco",             min_stock: 1, warn_coef: 1.5 },
  { id: 23, name: "Мешок-пылесборник",             min_stock: 1, warn_coef: 2   },
  { id: 24, name: "Аккумулятор Deco",              min_stock: 1, warn_coef: 2   },
  { id: 25, name: "Насадка (носик) Deco",          min_stock: 1, warn_coef: 1.5 },
  { id: 26, name: "Зарядное б/п Deco",             min_stock: 1, warn_coef: 1.5 },
  // Ящик 7 — Слаботочка
  { id: 27, name: "Б/п новые",                     min_stock: 1, warn_coef: 2   },
  { id: 28, name: "Б/п старые",                    min_stock: 0, warn_coef: 1.5 },
  { id: 29, name: "Hub зарядный (новый)",          min_stock: 1, warn_coef: 1.5 },
  { id: 30, name: "Hub зарядный (старый)",         min_stock: 0, warn_coef: 1.5 },
  { id: 31, name: "Hub тёмно-серый мелкий",        min_stock: 1, warn_coef: 1.5 },
  { id: 32, name: "Hub серебристый",               min_stock: 1, warn_coef: 1.5 },
  { id: 33, name: "Б/п переносного принтера",      min_stock: 1, warn_coef: 1.5 },
  { id: 34, name: "Провода SH/MX/ZH/GH/HX",       min_stock: 0, warn_coef: 1.5 },
  { id: 35, name: "Тройник XT90-60",               min_stock: 0, warn_coef: 1.5 },
  { id: 36, name: "Тройник XT60-60",               min_stock: 0, warn_coef: 1.5 },
  { id: 37, name: "Тройник XT90-60 (двойник)",     min_stock: 0, warn_coef: 1.5 },
  { id: 38, name: "Удлинитель AS150-XT90 (мама)",  min_stock: 1, warn_coef: 2   },
  { id: 39, name: "Переходник AS150 +/-",          min_stock: 2, warn_coef: 2   },
  { id: 40, name: "Удлинитель AS150-XT90 (папа)",  min_stock: 1, warn_coef: 2   },
  { id: 41, name: "Удлинитель AS150-AS150",        min_stock: 1, warn_coef: 2   },
  { id: 42, name: "Переходник XT60(м)-XT90(п)",   min_stock: 0, warn_coef: 1.5 },
  { id: 43, name: "Переходник XT69(м)-XT30(м)",   min_stock: 0, warn_coef: 1.5 },
  { id: 44, name: "Переходник XT60(м)-XT30(м)",   min_stock: 0, warn_coef: 1.5 },
  { id: 45, name: "Переходник XT60(п)-XT90(п)",   min_stock: 0, warn_coef: 1.5 },
  { id: 46, name: "Переходник XT60(п)-XT90(м)",   min_stock: 0, warn_coef: 1.5 },
  { id: 47, name: "Переходник XT60(п)-XT30(п)",   min_stock: 0, warn_coef: 1.5 },
  { id: 48, name: "Переходник XT60(м)-XT90(м)",   min_stock: 0, warn_coef: 1.5 },
  { id: 49, name: "Переходник XT60(м)-XT30(п)",   min_stock: 0, warn_coef: 1.5 },
  { id: 50, name: "Разъёмы GHR-08V-S JST",        min_stock: 0, warn_coef: 1.5 },
  // Ящик 8 — Ethernet
  { id: 51, name: "Обжимка RJ45",                  min_stock: 1, warn_coef: 1.5 },
  { id: 52, name: "Генератор проверки кабеля",     min_stock: 1, warn_coef: 1.5 },
  { id: 53, name: "Катушка питания XT60",           min_stock: 0, warn_coef: 1.5 },
  { id: 54, name: "Патчкорды",                      min_stock: 2, warn_coef: 2   },
  { id: 55, name: "Мышь компьютерная",              min_stock: 1, warn_coef: 1.5 },
  { id: 56, name: "Кабель питания монитора",        min_stock: 1, warn_coef: 1.5 },
  // Ящик 9 — Разное
  { id: 57, name: "Компас",                         min_stock: 1, warn_coef: 2   },
  { id: 58, name: "Свинец для полезной нагрузки",  min_stock: 0, warn_coef: 1.5 },
  { id: 59, name: "Струбцинка мини",               min_stock: 1, warn_coef: 1.5 },
  { id: 60, name: "Лезвия канцелярского ножа",     min_stock: 1, warn_coef: 2   },
  { id: 61, name: "Пистолет компрессора",           min_stock: 1, warn_coef: 1.5 },
  { id: 62, name: "Маркеры / ручки",               min_stock: 1, warn_coef: 2   },
  { id: 63, name: "Тряпочка для линз",             min_stock: 1, warn_coef: 1.5 },
  { id: 64, name: "Ключ на 8",                     min_stock: 1, warn_coef: 1.5 },
  { id: 65, name: "Виброразвязка",                 min_stock: 0, warn_coef: 1.5 },
  // Ящик 10 — Измерительные приборы
  { id: 66, name: "Осциллограф (новый)",           min_stock: 1, warn_coef: 1.5 },
  { id: 67, name: "Осциллограф (старый)",          min_stock: 0, warn_coef: 1.5 },
  // Ящик 11 — Клей / стяжки
  { id: 68, name: "Металл лента",                  min_stock: 0, warn_coef: 1.5 },
  { id: 69, name: "Двухсторонний скотч 3М",        min_stock: 1, warn_coef: 2   },
  { id: 70, name: "Фум-лента",                     min_stock: 1, warn_coef: 2   },
  { id: 71, name: "Малярный скотч",                min_stock: 1, warn_coef: 2   },
  { id: 72, name: "Скотч прозрачный",              min_stock: 1, warn_coef: 2   },
  { id: 73, name: "Изолента SafeLine",             min_stock: 1, warn_coef: 2   },
  { id: 74, name: "Изолента 3М Scotch",            min_stock: 1, warn_coef: 2   },
  { id: 75, name: "Изолента тряпичная",            min_stock: 1, warn_coef: 2   },
  { id: 76, name: "Изолента жёлтая",              min_stock: 1, warn_coef: 2   },
  { id: 77, name: "Термоклей (уп.)",               min_stock: 1, warn_coef: 2   },
  { id: 78, name: "Термопистолет",                 min_stock: 1, warn_coef: 1.5 },
  { id: 79, name: "Циакрин",                       min_stock: 1, warn_coef: 2   },
  { id: 80, name: "Активатор циакрина",            min_stock: 1, warn_coef: 2   },
  { id: 81, name: "Стяжки пластиковые (уп.)",     min_stock: 1, warn_coef: 2   },
  // Ящик 12 — Зарядки / провода
  { id: 82, name: "Power bank",                    min_stock: 2, warn_coef: 2   },
  { id: 83, name: "Воздуходувка мелкая",           min_stock: 1, warn_coef: 1.5 },
  { id: 84, name: "Фонарь налобный",               min_stock: 1, warn_coef: 1.5 },
  { id: 85, name: "Провод Type-C / Type-C",        min_stock: 2, warn_coef: 2   },
  { id: 86, name: "Провод USB / Type-C",           min_stock: 2, warn_coef: 2   },
  { id: 87, name: "Провод USB / microUSB",         min_stock: 1, warn_coef: 2   },
  { id: 88, name: "Удлинитель USB / USB",          min_stock: 0, warn_coef: 1.5 },
  { id: 89, name: "Удлинитель Type-C / Type-C",   min_stock: 0, warn_coef: 1.5 },
  // Ящик 13 — Выносной инструмент
  { id: 90, name: "Отвёртка электрическая",        min_stock: 1, warn_coef: 1.5 },
  { id: 91, name: "Отвёртка Torx T10",             min_stock: 2, warn_coef: 2   },
  { id: 92, name: "Отвёртка Torx T8",              min_stock: 2, warn_coef: 2   },
  { id: 93, name: "Отвёртка Torx T6",              min_stock: 1, warn_coef: 2   },
  { id: 94, name: "Ключ 8мм",                      min_stock: 2, warn_coef: 2   },
  { id: 95, name: "Бокорезы (выносные)",           min_stock: 1, warn_coef: 1.5 },
  { id: 96, name: "Пинцет",                        min_stock: 1, warn_coef: 1.5 },
  { id: 97, name: "Ремешок для баток (большой)",  min_stock: 5, warn_coef: 2   },
  { id: 98, name: "Ремешок для баток (малый)",    min_stock: 1, warn_coef: 2   },
  { id: 99, name: "Ремешок с креплением",          min_stock: 2, warn_coef: 2   },
  // Ящик 14 — Метизы
  { id: 100, name: "Органайзер с метизами",        min_stock: 3, warn_coef: 2   },
  // Ящик 16 — Паячный
  { id: 101, name: "Паяльный фен",                 min_stock: 1, warn_coef: 1.5 },
  { id: 102, name: "Спирт",                        min_stock: 1, warn_coef: 2   },
  { id: 103, name: "Термоусадка (уп.)",            min_stock: 1, warn_coef: 2   },
  { id: 104, name: "Провода для пайки (уп.)",      min_stock: 1, warn_coef: 2   },
  { id: 105, name: "Паяльник переносной",          min_stock: 1, warn_coef: 1.5 },
  { id: 106, name: "Губка металл. для жала",       min_stock: 1, warn_coef: 2   },
  { id: 107, name: "Очки защитные (кейс)",         min_stock: 1, warn_coef: 1.5 },
  { id: 108, name: "Кейс с флюсом и расходниками", min_stock: 1, warn_coef: 1.5 },
  { id: 109, name: "Flux-off",                     min_stock: 1, warn_coef: 2   },
  // Ящик 17 — Наземка
  { id: 110, name: "Антенна Helix малая",          min_stock: 1, warn_coef: 2   },
  { id: 111, name: "Антенна Helix большая",        min_stock: 1, warn_coef: 2   },
  { id: 112, name: "Кастрюля",                     min_stock: 0, warn_coef: 1.5 },
  { id: 113, name: "Хлопушка",                     min_stock: 0, warn_coef: 1.5 },
  { id: 114, name: "Антенна круглая плоская",      min_stock: 0, warn_coef: 1.5 },
  { id: 115, name: "Ящик с антеннами ВЧ",          min_stock: 1, warn_coef: 1.5 },
  { id: 116, name: "Гермес",                       min_stock: 1, warn_coef: 1.5 },
  { id: 117, name: "Удлинители/переходники (зиплок)", min_stock: 0, warn_coef: 1.5 },
  { id: 118, name: "Антенны Foxeer (зиплок)",      min_stock: 0, warn_coef: 1.5 },
  // Ящик 18 — Связь
  { id: 119, name: "TBeacon",                      min_stock: 3, warn_coef: 2   },
  { id: 120, name: "Приёмник TBeacon",             min_stock: 1, warn_coef: 1.5 },
  { id: 121, name: "Рация",                        min_stock: 2, warn_coef: 2   },
  { id: 122, name: "Транспондер для дронов",       min_stock: 3, warn_coef: 2   },
  // Ящики 19-22 — Вода
  { id: 123, name: "Вода газированная (бут.)",     min_stock: 2, warn_coef: 2   },
  { id: 124, name: "Чай бутылочный",               min_stock: 2, warn_coef: 2   },
  { id: 125, name: "Энергетики",                   min_stock: 2, warn_coef: 2   },
  { id: 126, name: "Квас",                         min_stock: 1, warn_coef: 2   },
  // Ящик 23 — Весы / хоз. отдел
  { id: 127, name: "Весы большие",                 min_stock: 1, warn_coef: 1.5 },
  { id: 128, name: "Весы (безмен)",                min_stock: 1, warn_coef: 1.5 },
  { id: 129, name: "Перчатки рабочие (пар)",       min_stock: 2, warn_coef: 2   },
  { id: 130, name: "Салфетки влажные (уп.)",       min_stock: 1, warn_coef: 2   },
  { id: 131, name: "Паста для рук очищающая",      min_stock: 1, warn_coef: 2   },
  { id: 132, name: "Очиститель для стёкол",        min_stock: 1, warn_coef: 2   },
  { id: 133, name: "Тряпка микрофибра",            min_stock: 1, warn_coef: 1.5 },
  { id: 134, name: "Пакеты для мусора малые (уп.)", min_stock: 1, warn_coef: 2  },
  { id: 135, name: "Пакеты для мусора большие (уп.)", min_stock: 1, warn_coef: 2 },
  // Ящик 24 — Закусочная
  { id: 136, name: "Сахар (уп.)",                  min_stock: 1, warn_coef: 2   },
  { id: 137, name: "Чай (пакетики)",               min_stock: 1, warn_coef: 2   },
  { id: 138, name: "Кофе",                         min_stock: 1, warn_coef: 2   },
  { id: 139, name: "Чайник",                       min_stock: 1, warn_coef: 1.5 },
  { id: 140, name: "Газ (баллон)",                 min_stock: 1, warn_coef: 3   },
  { id: 141, name: "Стаканчики бумажные",          min_stock: 5, warn_coef: 3   },
  { id: 142, name: "Тарелки одноразовые (уп.)",   min_stock: 1, warn_coef: 2   },
  { id: 143, name: "Ложка столовая одноразовая (уп.)", min_stock: 1, warn_coef: 2 },
  { id: 144, name: "Вилка одноразовая (уп.)",     min_stock: 1, warn_coef: 2   },
  { id: 145, name: "Ложка чайная одноразовая (уп.)", min_stock: 1, warn_coef: 2 },
  { id: 146, name: "Плитка газовая",               min_stock: 1, warn_coef: 1.5 },
  { id: 147, name: "Горелка газовая",              min_stock: 1, warn_coef: 1.5 },
  { id: 148, name: "Снеки",                        min_stock: 1, warn_coef: 2   },
  // Ящик 25 — Кальянная
  { id: 149, name: "Кальян",                       min_stock: 1, warn_coef: 1.5 },
  { id: 150, name: "Щипцы для кальяна",            min_stock: 2, warn_coef: 2   },
  { id: 151, name: "Фольга для кальяна (уп.)",    min_stock: 1, warn_coef: 2   },
  { id: 152, name: "Уголь для кальяна (пачка)",   min_stock: 1, warn_coef: 3   },
  { id: 153, name: "Табак (уп.)",                  min_stock: 2, warn_coef: 2   },
  { id: 154, name: "Вода для кальяна (л)",         min_stock: 2, warn_coef: 2   },
  { id: 155, name: "Вода питьевая (л)",            min_stock: 2, warn_coef: 2   }
];

// { item_id, drawer_id, quantity }
const SEED_STOCK = [
  // Ящик 1
  { item_id: 1,   drawer_id: 1,  quantity: 6  },
  // Ящик 2
  { item_id: 2,   drawer_id: 2,  quantity: 8  },
  // Ящик 3
  { item_id: 3,   drawer_id: 3,  quantity: 1  },
  { item_id: 4,   drawer_id: 3,  quantity: 3  },
  { item_id: 5,   drawer_id: 3,  quantity: 3  },
  { item_id: 6,   drawer_id: 3,  quantity: 3  },
  { item_id: 7,   drawer_id: 3,  quantity: 3  },
  { item_id: 8,   drawer_id: 3,  quantity: 3  },
  { item_id: 9,   drawer_id: 3,  quantity: 3  },
  { item_id: 10,  drawer_id: 3,  quantity: 1  },
  { item_id: 11,  drawer_id: 3,  quantity: 1  },
  { item_id: 12,  drawer_id: 3,  quantity: 1  },
  { item_id: 13,  drawer_id: 3,  quantity: 1  },
  { item_id: 14,  drawer_id: 3,  quantity: 1  },
  { item_id: 15,  drawer_id: 3,  quantity: 1  },
  { item_id: 16,  drawer_id: 3,  quantity: 1  },
  { item_id: 17,  drawer_id: 3,  quantity: 2  },
  { item_id: 18,  drawer_id: 3,  quantity: 1  },
  // Ящик 5
  { item_id: 19,  drawer_id: 5,  quantity: 1  },
  { item_id: 20,  drawer_id: 5,  quantity: 1  },
  { item_id: 21,  drawer_id: 5,  quantity: 4  },
  // Ящик 6
  { item_id: 22,  drawer_id: 6,  quantity: 1  },
  { item_id: 23,  drawer_id: 6,  quantity: 1  },
  { item_id: 24,  drawer_id: 6,  quantity: 2  },
  { item_id: 25,  drawer_id: 6,  quantity: 1  },
  { item_id: 26,  drawer_id: 6,  quantity: 1  },
  // Ящик 7
  { item_id: 27,  drawer_id: 7,  quantity: 2  },
  { item_id: 28,  drawer_id: 7,  quantity: 2  },
  { item_id: 29,  drawer_id: 7,  quantity: 1  },
  { item_id: 30,  drawer_id: 7,  quantity: 1  },
  { item_id: 31,  drawer_id: 7,  quantity: 2  },
  { item_id: 32,  drawer_id: 7,  quantity: 2  },
  { item_id: 33,  drawer_id: 7,  quantity: 1  },
  { item_id: 34,  drawer_id: 7,  quantity: 1  },
  { item_id: 35,  drawer_id: 7,  quantity: 1  },
  { item_id: 36,  drawer_id: 7,  quantity: 2  },
  { item_id: 37,  drawer_id: 7,  quantity: 1  },
  { item_id: 38,  drawer_id: 7,  quantity: 3  },
  { item_id: 39,  drawer_id: 7,  quantity: 5  },
  { item_id: 40,  drawer_id: 7,  quantity: 3  },
  { item_id: 41,  drawer_id: 7,  quantity: 2  },
  { item_id: 42,  drawer_id: 7,  quantity: 1  },
  { item_id: 43,  drawer_id: 7,  quantity: 2  },
  { item_id: 44,  drawer_id: 7,  quantity: 2  },
  { item_id: 45,  drawer_id: 7,  quantity: 2  },
  { item_id: 46,  drawer_id: 7,  quantity: 2  },
  { item_id: 47,  drawer_id: 7,  quantity: 2  },
  { item_id: 48,  drawer_id: 7,  quantity: 2  },
  { item_id: 49,  drawer_id: 7,  quantity: 2  },
  { item_id: 50,  drawer_id: 7,  quantity: 1  },
  // Ящик 8
  { item_id: 51,  drawer_id: 8,  quantity: 1  },
  { item_id: 52,  drawer_id: 8,  quantity: 1  },
  { item_id: 53,  drawer_id: 8,  quantity: 1  },
  { item_id: 54,  drawer_id: 8,  quantity: 4  },
  { item_id: 55,  drawer_id: 8,  quantity: 1  },
  { item_id: 56,  drawer_id: 8,  quantity: 1  },
  // Ящик 9
  { item_id: 57,  drawer_id: 9,  quantity: 2  },
  { item_id: 58,  drawer_id: 9,  quantity: 1  },
  { item_id: 59,  drawer_id: 9,  quantity: 1  },
  { item_id: 60,  drawer_id: 9,  quantity: 1  },
  { item_id: 61,  drawer_id: 9,  quantity: 1  },
  { item_id: 62,  drawer_id: 9,  quantity: 1  },
  { item_id: 63,  drawer_id: 9,  quantity: 1  },
  { item_id: 64,  drawer_id: 9,  quantity: 1  },
  { item_id: 65,  drawer_id: 9,  quantity: 1  },
  // Ящик 10
  { item_id: 66,  drawer_id: 10, quantity: 1  },
  { item_id: 67,  drawer_id: 10, quantity: 1  },
  // Ящик 11
  { item_id: 68,  drawer_id: 11, quantity: 1  },
  { item_id: 69,  drawer_id: 11, quantity: 1  },
  { item_id: 70,  drawer_id: 11, quantity: 1  },
  { item_id: 71,  drawer_id: 11, quantity: 1  },
  { item_id: 72,  drawer_id: 11, quantity: 1  },
  { item_id: 73,  drawer_id: 11, quantity: 1  },
  { item_id: 74,  drawer_id: 11, quantity: 1  },
  { item_id: 75,  drawer_id: 11, quantity: 1  },
  { item_id: 76,  drawer_id: 11, quantity: 1  },
  { item_id: 77,  drawer_id: 11, quantity: 1  },
  { item_id: 78,  drawer_id: 11, quantity: 2  },
  { item_id: 79,  drawer_id: 11, quantity: 2  },
  { item_id: 80,  drawer_id: 11, quantity: 1  },
  { item_id: 81,  drawer_id: 11, quantity: 4  },
  // Ящик 12
  { item_id: 82,  drawer_id: 12, quantity: 5  },
  { item_id: 83,  drawer_id: 12, quantity: 2  },
  { item_id: 84,  drawer_id: 12, quantity: 1  },
  { item_id: 85,  drawer_id: 12, quantity: 6  },
  { item_id: 86,  drawer_id: 12, quantity: 6  },
  { item_id: 87,  drawer_id: 12, quantity: 3  },
  { item_id: 88,  drawer_id: 12, quantity: 2  },
  { item_id: 89,  drawer_id: 12, quantity: 1  },
  // Ящик 13
  { item_id: 90,  drawer_id: 13, quantity: 1  },
  { item_id: 91,  drawer_id: 13, quantity: 4  },
  { item_id: 92,  drawer_id: 13, quantity: 4  },
  { item_id: 93,  drawer_id: 13, quantity: 3  },
  { item_id: 94,  drawer_id: 13, quantity: 5  },
  { item_id: 95,  drawer_id: 13, quantity: 1  },
  { item_id: 96,  drawer_id: 13, quantity: 1  },
  { item_id: 97,  drawer_id: 13, quantity: 21 },
  { item_id: 98,  drawer_id: 13, quantity: 1  },
  { item_id: 99,  drawer_id: 13, quantity: 6  },
  // Ящик 14
  { item_id: 100, drawer_id: 14, quantity: 10 },
  // Ящик 16
  { item_id: 101, drawer_id: 16, quantity: 2  },
  { item_id: 102, drawer_id: 16, quantity: 1  },
  { item_id: 103, drawer_id: 16, quantity: 1  },
  { item_id: 104, drawer_id: 16, quantity: 1  },
  { item_id: 105, drawer_id: 16, quantity: 2  },
  { item_id: 106, drawer_id: 16, quantity: 1  },
  { item_id: 107, drawer_id: 16, quantity: 1  },
  { item_id: 108, drawer_id: 16, quantity: 1  },
  { item_id: 109, drawer_id: 16, quantity: 1  },
  // Ящик 17
  { item_id: 110, drawer_id: 17, quantity: 2  },
  { item_id: 111, drawer_id: 17, quantity: 2  },
  { item_id: 112, drawer_id: 17, quantity: 1  },
  { item_id: 113, drawer_id: 17, quantity: 1  },
  { item_id: 114, drawer_id: 17, quantity: 1  },
  { item_id: 115, drawer_id: 17, quantity: 1  },
  { item_id: 116, drawer_id: 17, quantity: 1  },
  { item_id: 117, drawer_id: 17, quantity: 1  },
  { item_id: 118, drawer_id: 17, quantity: 1  },
  // Ящик 18
  { item_id: 119, drawer_id: 18, quantity: 5  },
  { item_id: 120, drawer_id: 18, quantity: 1  },
  { item_id: 121, drawer_id: 18, quantity: 4  },
  { item_id: 122, drawer_id: 18, quantity: 8  },
  // Ящики 19-22 (вода)
  { item_id: 123, drawer_id: 19, quantity: 0  },
  { item_id: 124, drawer_id: 20, quantity: 0  },
  { item_id: 125, drawer_id: 21, quantity: 0  },
  { item_id: 126, drawer_id: 22, quantity: 0  },
  // Ящик 23
  { item_id: 127, drawer_id: 23, quantity: 1  },
  { item_id: 128, drawer_id: 23, quantity: 1  },
  { item_id: 129, drawer_id: 23, quantity: 5  },
  { item_id: 130, drawer_id: 23, quantity: 4  },
  { item_id: 131, drawer_id: 23, quantity: 1  },
  { item_id: 132, drawer_id: 23, quantity: 1  },
  { item_id: 133, drawer_id: 23, quantity: 1  },
  { item_id: 134, drawer_id: 23, quantity: 1  },
  { item_id: 135, drawer_id: 23, quantity: 1  },
  // Ящик 24
  { item_id: 136, drawer_id: 24, quantity: 1  },
  { item_id: 137, drawer_id: 24, quantity: 1  },
  { item_id: 138, drawer_id: 24, quantity: 1  },
  { item_id: 139, drawer_id: 24, quantity: 1  },
  { item_id: 140, drawer_id: 24, quantity: 2  },
  { item_id: 141, drawer_id: 24, quantity: 5  },
  { item_id: 142, drawer_id: 24, quantity: 1  },
  { item_id: 143, drawer_id: 24, quantity: 1  },
  { item_id: 144, drawer_id: 24, quantity: 1  },
  { item_id: 145, drawer_id: 24, quantity: 1  },
  { item_id: 146, drawer_id: 24, quantity: 1  },
  { item_id: 147, drawer_id: 24, quantity: 1  },
  { item_id: 148, drawer_id: 24, quantity: 1  },
  // Ящик 25
  { item_id: 149, drawer_id: 25, quantity: 1  },
  { item_id: 150, drawer_id: 25, quantity: 3  },
  { item_id: 151, drawer_id: 25, quantity: 2  },
  { item_id: 152, drawer_id: 25, quantity: 3  },
  { item_id: 153, drawer_id: 25, quantity: 16 },
  { item_id: 154, drawer_id: 25, quantity: 5  },
  { item_id: 155, drawer_id: 25, quantity: 5  }
];

async function seedDatabase() {
  const count = await db.drawers.count();
  if (count > 0) return;

  await db.transaction('rw', db.drawers, db.items, db.stock, async () => {
    await db.drawers.bulkAdd(SEED_DRAWERS);
    await db.items.bulkAdd(SEED_ITEMS);
    await db.stock.bulkAdd(SEED_STOCK);
  });

  console.log('Seed data loaded');
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getItemStatus(quantity, min_stock, warn_coef) {
  if (min_stock === 0) return 'green';
  if (quantity < min_stock) return 'red';
  if (quantity < min_stock * warn_coef) return 'yellow';
  return 'green';
}

async function getDrawerStatus(drawerId) {
  const stockRows = await db.stock.where('drawer_id').equals(drawerId).toArray();
  if (stockRows.length === 0) return 'empty';

  let hasRed = false, hasYellow = false;
  for (const s of stockRows) {
    const item = await db.items.get(s.item_id);
    if (!item) continue;
    const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
    if (status === 'red') hasRed = true;
    else if (status === 'yellow') hasYellow = true;
  }
  if (hasRed) return 'red';
  if (hasYellow) return 'yellow';
  return 'green';
}

async function getDrawerStatusMap() {
  const all = await db.stock.toArray();
  const itemIds = [...new Set(all.map(s => s.item_id))];
  const items = await db.items.bulkGet(itemIds);
  const itemMap = {};
  items.forEach(it => { if (it) itemMap[it.id] = it; });

  const drawerMap = {};
  for (const s of all) {
    if (!drawerMap[s.drawer_id]) drawerMap[s.drawer_id] = { hasRed: false, hasYellow: false, hasItems: true };
    const item = itemMap[s.item_id];
    if (!item) continue;
    const status = getItemStatus(s.quantity, item.min_stock, item.warn_coef);
    if (status === 'red') drawerMap[s.drawer_id].hasRed = true;
    else if (status === 'yellow') drawerMap[s.drawer_id].hasYellow = true;
  }

  const result = {};
  for (const [id, d] of Object.entries(drawerMap)) {
    if (d.hasRed) result[id] = 'red';
    else if (d.hasYellow) result[id] = 'yellow';
    else result[id] = 'green';
  }
  return result;
}

async function addHistoryEntry(entry) {
  await db.history.add({ ...entry, timestamp: Date.now() });
}
