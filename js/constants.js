/* Numerical formatting/parsing constants */
const NUM_STRINGS = {
  COMMA: ",",
  TENTH_PERCENT: ".1%",
  WHOLE_PERCENT: ".0%",
  SI_2: ".2s",
  SI_3: ".3s"
};

const NUM_FORMAT = {};
Object.entries(NUM_STRINGS).forEach(([key, value]) => {
  NUM_FORMAT[key] = d3.format(value);
});

export const numMap = {
  STRING: NUM_STRINGS,
  FORMAT: NUM_FORMAT
};
