
// taken from https://sashat.me/2017/01/11/list-of-20-simple-distinct-colors/ . removed red, black and white
const colors = [
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#bfef45',
  '#fabebe',
  '#469990',
  '#e6beff',
  '#9A6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#a9a9a9',
];
const colorsReversed = [...colors].reverse();

// taken from https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor = '#ffffff', darkColor = '#000000') {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });
  var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
  return (L > 0.179) ? darkColor : lightColor;
}

function getRandomColor() {
  var letters = '0123456789abcdef';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const getAvailableindex = excludeColors => {
  const usedIndex = colorsReversed.findIndex(c => excludeColors.includes(c));
  // if no color is used, or the last color is used (loop around)
  // return first available color from start
  if (usedIndex === 0 || usedIndex === -1) {
    return colors.findIndex(c => !excludeColors.includes(c)); // returns -1 if no color is available
  }
  const availableIndexOfReversed = usedIndex - 1;
  return colorsReversed.length - availableIndexOfReversed - 1;
}

const getNewColor = (excludeColors = []) => {
  const availabeIndex = getAvailableindex(excludeColors);
  let resultColor = availabeIndex !== -1 ? colors[availabeIndex] : getRandomColor();
  while (excludeColors.includes(resultColor)) {
    resultColor = getRandomColor();
  };
  const textColor = pickTextColorBasedOnBgColorAdvanced(resultColor);
  return [resultColor, textColor];
}

export default getNewColor;