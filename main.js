const data = (await (await fetch("caffeine.csv")).text())
  .trim()
  .split("\n")
  .map((s) => s.split(","))
  .slice(1)
  .map(([date, source, grams]) => ({
    date,
    source,
    caffeine: parseFloat(grams) * (source === "coffee" ? 10 : 30),
  }));

const bars = {};
for (const { date, source, caffeine } of data) {
  bars[date] ||= [];
  bars[date].push({ source, caffeine });
}

function h(tag, childOrAttrs, ...children) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (childOrAttrs instanceof Node || typeof childOrAttrs === "string") {
    element.append(childOrAttrs, ...children);
  } else {
    for (const [key, val] of Object.entries(childOrAttrs)) {
      element.setAttribute(key, val);
    }
    element.append(...children);
  }
  return element;
}

const BAR_PAD = 5;
const BAR_WIDTH = 20;
const LABEL_INNER_PAD = 5;
const LEGEND_OFFSET_X = 80;
const LEGEND_OFFSET_Y = 30;
const LEGEND_SQUARE_SIZE = 10;
const LINE_HEIGHT = 16;
const PAD = 20;
const X_LABEL_HEIGHT = 50;
const X_LABEL_OFFSET = 50;
const Y_LABEL_OFFSET = 60;
const Y_LABEL_STEP = 30;
const Y_LABEL_WIDTH = 80;

const TEA_COLOUR = "#8d8";
const COFFEE_COLOUR = "#88d";

const MAX_Y = Object.values(bars)
  .map((bar) => bar.map((v) => v.caffeine).reduce((a, b) => a + b))
  .reduce((a, b) => Math.max(a, b));
const WIDTH =
  PAD +
  Y_LABEL_WIDTH +
  Object.keys(bars).length * (BAR_WIDTH + BAR_PAD) -
  BAR_PAD +
  PAD;
const HEIGHT = PAD + MAX_Y + X_LABEL_HEIGHT + PAD;

document.querySelector("svg").replaceWith(
  h(
    "svg",
    {
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      style: `max-width: ${WIDTH}px; width: 100%;`,
    },
    h(
      "style",
      `text {
         font-family: "Berkeley Mono";
         font-size: 10px;
         color: #222;
       }`
    ),
    h(
      "text",
      {
        x: PAD + Y_LABEL_WIDTH - Y_LABEL_OFFSET,
        y: PAD + MAX_Y / 2 - LINE_HEIGHT / 2,
        "alignment-baseline": "central",
        "text-anchor": "middle",
      },
      "Caffeine"
    ),
    h(
      "text",
      {
        x: PAD + Y_LABEL_WIDTH - Y_LABEL_OFFSET,
        y: PAD + MAX_Y / 2 + LINE_HEIGHT / 2,
        "alignment-baseline": "central",
        "text-anchor": "middle",
      },
      "(mg)"
    ),
    ...(() => {
      let col = [];
      for (let y = MAX_Y; y >= 0; y -= Y_LABEL_STEP) {
        col.push(
          h(
            "text",
            {
              x: PAD + Y_LABEL_WIDTH - LABEL_INNER_PAD,
              y: PAD + MAX_Y - y,
              "alignment-baseline": "central",
              "text-anchor": "end",
            },
            y
          )
        );
      }
      return col;
    })(),
    ...Object.entries(bars).flatMap(([date, bar], i) => {
      let col = [];
      let y = PAD + MAX_Y;
      for (const { source, caffeine } of bar) {
        y -= caffeine;
        col.push(
          h("rect", {
            x: PAD + Y_LABEL_WIDTH + i * (BAR_WIDTH + BAR_PAD),
            y,
            width: BAR_WIDTH,
            height: caffeine,
            fill: source === "tea" ? TEA_COLOUR : COFFEE_COLOUR,
          })
        );
      }
      col.push(
        h(
          "text",
          {
            x: PAD + Y_LABEL_WIDTH + i * (BAR_WIDTH + BAR_PAD) + BAR_WIDTH / 2,
            y: PAD + MAX_Y + LABEL_INNER_PAD,
            "alignment-baseline": "hanging",
            "text-anchor": "middle",
          },
          new Date(date).getDate()
        )
      );
      col.push(
        h(
          "text",
          {
            x: PAD + Y_LABEL_WIDTH + i * (BAR_WIDTH + BAR_PAD) + BAR_WIDTH / 2,
            y: PAD + MAX_Y + LABEL_INNER_PAD + LINE_HEIGHT,
            "alignment-baseline": "hanging",
            "text-anchor": "middle",
          },
          date == "2023-02-13" ? "Feb" : date == "2023-03-01" ? "Mar" : ""
        )
      );
      return col;
    }),
    h(
      "text",
      {
        x: (Y_LABEL_WIDTH + WIDTH) / 2,
        y: PAD + MAX_Y + X_LABEL_OFFSET,
        "alignment-baseline": "central",
        "text-anchor": "middle",
      },
      "Date"
    ),
    h("rect", {
      x: WIDTH - PAD - LEGEND_OFFSET_X,
      y: PAD + LEGEND_OFFSET_Y - LEGEND_SQUARE_SIZE / 2,
      height: LEGEND_SQUARE_SIZE,
      width: LEGEND_SQUARE_SIZE,
      fill: TEA_COLOUR,
    }),
    h(
      "text",
      {
        x: WIDTH - PAD - LEGEND_OFFSET_X + LEGEND_SQUARE_SIZE + LABEL_INNER_PAD,
        y: PAD + LEGEND_OFFSET_Y,
        "alignment-baseline": "central",
      },
      "tea"
    ),
    h("rect", {
      x: WIDTH - PAD - LEGEND_OFFSET_X,
      y: PAD + LEGEND_OFFSET_Y - LEGEND_SQUARE_SIZE / 2 + LINE_HEIGHT,
      height: LEGEND_SQUARE_SIZE,
      width: LEGEND_SQUARE_SIZE,
      fill: COFFEE_COLOUR,
    }),
    h(
      "text",
      {
        x: WIDTH - PAD - LEGEND_OFFSET_X + LEGEND_SQUARE_SIZE + LABEL_INNER_PAD,
        y: PAD + LEGEND_OFFSET_Y + LINE_HEIGHT,
        "alignment-baseline": "central",
      },
      "coffee"
    )
  )
);
