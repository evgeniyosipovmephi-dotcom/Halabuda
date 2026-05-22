const LAYOUT = {
  cabinets: [
    {
      id: 1,
      name: "Основной шкаф",
      rows: [
        [
          { id: 1,  label: "А1", flex: 1 },
          { id: 2,  label: "А2", flex: 1 }
        ],
        [
          { id: 3,  label: "Б1", flex: 1 },
          { id: 4,  label: "Б2", flex: 1 },
          { id: 5,  label: "Б3", flex: 1 },
          { id: 6,  label: "Б4", flex: 1 },
          { id: 7,  label: "Б5", flex: 1 }
        ],
        [
          { id: 8,  label: "В1", flex: 1 },
          { id: 9,  label: "В2", flex: 1 },
          { id: 10, label: "В3", flex: 1 },
          { id: 11, label: "В4", flex: 1 },
          { id: 12, label: "В5", flex: 1 }
        ],
        [
          { id: 13, label: "Г1", flex: 1 },
          { id: 14, label: "Г2", flex: 1 },
          { id: 15, label: "Г3", flex: 1 },
          { id: 16, label: "Г4", flex: 1 }
        ],
        [
          { id: 17, label: "Д1", flex: 2 },
          { id: 18, label: "Д2", flex: 1 }
        ],
        [
          { id: 19, label: "Е1", flex: 1 },
          { id: 20, label: "Е2", flex: 1 },
          { id: 21, label: "Е3", flex: 1 },
          { id: 22, label: "Е4", flex: 1 }
        ]
      ]
    },
    {
      id: 2,
      name: "Кухня",
      rows: [
        [{ id: 23, label: "А1", flex: 1 }],
        [{ id: null, label: "пусто", flex: 1, empty: true }],
        [{ id: 24, label: "В1", flex: 1 }],
        [{ id: 25, label: "Г1", flex: 1 }]
      ]
    }
  ]
};
