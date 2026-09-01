/* let iucnColors = {
    "EX": { bg: "rgb(0,0,0)", fg: "rgb(255,255,255)" },
    "EW": { bg: "rgb(84,35,68)", fg: "rgb(255,255,255)" },
    "RE": { bg: "rgb(155,79,150)", fg: "rgb(255,255,255)" },
    "CR": { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
    "EN": { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
    "VU": { bg: "rgb(249,232,18)", fg: "rgb(0,0,0)" },
    "NT": { bg: "rgb(204,226,37)", fg: "rgb(0,0,0)" },
    "LC": { bg: "rgb(97,198,89)", fg: "rgb(0,0,0)" },
    "DD": { bg: "rgb(209,209,198)", fg: "rgb(0,0,0)" },
    "NA": { bg: "rgb(193,181,165)", fg: "rgb(0,0,0)" },
    "NE": { bg: "rgb(255,255,255)", fg: "rgb(0,0,0)" }
}; */

import { filter } from "d3";

const { timeHours } = require("d3-time");

class ColorScheme {
  constructor(name, colors) {
    this.name = name;
    this.colors = colors;
  }
}

let ColorBlindColorScheme = new ColorScheme("ColorBrewer", [
  ["rgb(215,25,28)", "rgb(255,255,255)"],
  ["rgb(253,174,97)", "rgb(0,0,0)"],
  ["rgb(171,217,233)", "rgb(0,0,0)"],
  ["rgb(44,123,182)", "rgb(255,255,255)"],
  ["rgb(209,209,198)", "rgb(0,0,0)"]
]);

let IUCNColorScheme = new ColorScheme("IUCN", [
  ["rgb(216,29,4)", "rgb(255,255,255)"],
  ["rgb(252,127,63)", "rgb(255,255,255)"],
  ["rgb(249,232,18)", "rgb(0,0,0)"],
  ["rgb(97,198,89)", "rgb(0,0,0)"],
  ["rgb(209, 209, 198)", "rgb(0, 0, 0)"]
]);

export class ThreatLevel {
  constructor(name, abbreviation, assessmentType, numvalue, sort) {
    this.name = name;
    this.abbreviation = abbreviation;
    this.assessmentType = assessmentType;
    this.numvalue = numvalue;
    this.sort = sort;
  }

  getName() {
    return this.name;
  }

  getColor(colorBlind = false) {
    if (colorBlind) {
      return ColorBlindColorScheme.colors[this.numvalue][0];
    } else {
      return IUCNColorScheme.colors[this.numvalue][0];
    }
  }

  getForegroundColor(colorBlind = false) {
    if (colorBlind) {
      return ColorBlindColorScheme.colors[this.numvalue][1];
    } else {
      return IUCNColorScheme.colors[this.numvalue][1];
    }
  }

  getHashCode() {
    return this.abbreviation + this.assessmentType + this.sort;
  }
}

ThreatLevel.prototype.toJSON = function () {
  return {
    __type: "ThreatLevel",
    getName: this.getName,
    getForegroundColor: this.getForegroundColor,
    getHashCode: this.getHashCode,
    getColor: this.getColor,
    name: this.name,
    abbreviation: this.abbreviation,
    assessmentType: this.assessmentType,
    numvalue: this.numvalue,
    sort: this.sort
  };
};

ThreatLevel.revive = function (data) {
  // TODO: do basic validation
  return new ThreatLevel(
    data.name,
    data.abbreviation,
    data.assessmentType,
    data.numvalue,
    data.sort
  );
};

class AssessmentType {
  constructor(name, threatLevels) {
    this.name = name;
    this.threatLevels = threatLevels;

    this.dataDeficient = threatLevels.hasOwnProperty("DD")
      ? threatLevels["DD"]
      : new ThreatLevel(
          "Data Deficient",
          "DD",
          this.name,
          4,
          Object.keys(this.threatLevels).length
        );
  }

  getSortedLevels() {
    return Object.keys(this.threatLevels).sort((a, b) => {
      return this.threatLevels[a].sort - this.threatLevels[b].sort;
    });
  }

  get(key) {
    if (this.threatLevels.hasOwnProperty(key)) {
      return this.threatLevels[key];
    } else {
      const filtered = Object.values(this.threatLevels).filter((level) => {
        return level.name === key;
      });

      if (filtered.length > 0) {
        return filtered[0];
      }

      return this.dataDeficient;
    }
  }
}

export const iucnCategoriesSorted = [
  "NE",
  "NA",
  "DD",
  "nT",
  "LC",
  "NT",
  "V",
  "VU",
  "E",
  "A",
  "EN",
  "CR",
  "RE",
  "EW",
  "EX"
];

export const citesAppendixSorted = ["III", "II", "I"];

export const bgciAssessment = new AssessmentType("BGCI", {
  EX: new ThreatLevel("Extinct", "EX", "BGCI", 0, 0),
  TH: new ThreatLevel("Threatened", "TH", "BGCI", 1, 1),
  PT: new ThreatLevel("Possibly Threatened", "PT", "BGCI", 2, 2),
  nT: new ThreatLevel("Not Threatened", "nT", "BGCI", 3, 3),
  DD: new ThreatLevel("Data Deficient", "DD", "BGCI", 4, 4)
});

export const iucnAssessment = new AssessmentType("IUCN", {
  EX: new ThreatLevel("Extinct", "EX", "IUCN", 0, 0),
  EW: new ThreatLevel("Extinct in the wild", "EW", "IUCN", 0, 1),
  /* RE: new ThreatLevel("Regional Extinct", "RE", "IUCN", 0, 2), */
  CR: new ThreatLevel("Critical Endangered", "CR", "IUCN", 1, 3),
  EN: new ThreatLevel("Endangered", "EN", "IUCN", 1, 4),
  /* E: new ThreatLevel("Endangered", "E", "IUCN", 1, 4.5), */
  VU: new ThreatLevel("Vulnerable", "VU", "IUCN", 1, 5),
  /* V: new ThreatLevel("Vulnerable", "V", "IUCN", 1, 5.5), */
  NT: new ThreatLevel("Near Threatend", "NT", "IUCN", 2, 6),
  /* "LR/cd": new ThreatLevel(
    "Lower Risk / Conservation Dependent",
    "LR/cd",
    "IUCN",
    2,
    6.5
  ), */
  LC: new ThreatLevel("Least Concern", "LC", "IUCN", 3, 7),
  DD: new ThreatLevel("Data Deficient", "DD", "IUCN", 4, 8)
  /* K: new ThreatLevel("Insufficiently Known", "K", "IUCN", 4, 8.5),
  NA: new ThreatLevel("Not Assesset", "NA", "IUCN", 4, 9),
  NE: new ThreatLevel("Not Evaluated", "NE", "IUCN", 4, 10) */
});

export const citesAssessment = new AssessmentType("CITES", {
  I: new ThreatLevel("Appendix I", "I", "CITES", 0, 0),
  II: new ThreatLevel("Appendix II", "II", "CITES", 1, 1),
  III: new ThreatLevel("Appendix III", "III", "CITES", 2, 2),
  DD: new ThreatLevel("Data Deficient", "DD", "CITES", 4, 8)
});

export const iucnColors = {
  EX: { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
  EW: { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
  RE: { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
  CR: { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
  EN: { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
  VU: { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
  NT: { bg: "rgb(249,232,18)", fg: "rgb(0,0,0)" },
  LC: { bg: "rgb(97,198,89)", fg: "rgb(0,0,0)" },
  DD: { bg: "rgb(209,209,198)", fg: "rgb(0,0,0)" },
  NA: { bg: "rgb(193,181,165)", fg: "rgb(0,0,0)" },
  NE: { bg: "rgb(255,255,255)", fg: "rgb(0,0,0)" }
};
export const getIucnColor = function (d) {
  if (d !== undefined) {
    if (d.hasOwnProperty("text")) {
      return iucnColors[d.text] ? iucnColors[d.text].bg : iucnColors["DD"].bg;
    } else {
      if (iucnColors.hasOwnProperty(d)) {
        return iucnColors[d].bg;
      } else {
        return iucnColors["DD"].bg;
      }
    }
  } else {
    return iucnColors["DD"].bg;
  }
};
export const getIucnColorForeground = function (d) {
  return iucnColors[d.text] ? iucnColors[d.text].fg : iucnColors["DD"].fg;
};
//module.exports.iucnCategoriesSorted = ["EX", "EW", "RE", "CR", "EN", "VU", "V", "NT", "LC", "nT", "DD", "NA", "NE"];
export const citesScore = function (appendix) {
  switch (appendix) {
    case "I":
      return 1.0;
    case "II":
      return 2 / 3;
    case "III":
      return 1 / 3;
    default:
      return -1;
  }
};
export const citesScoreReverse = function (value) {
  if (value > 2 / 3) {
    return "I";
  } else if (value > 1 / 3) {
    return "II";
  } else if (value > 0.0) {
    return "III";
  } else if (value < 0) {
    return "DD";
  } else {
    return "DD";
  }
};
export const getCitesColor = function (appendix) {
  switch (appendix) {
    case "I":
      return getIucnColor({ text: "EX" });
    case "II":
      return getIucnColor({ text: "CR" });
    case "III":
      return getIucnColor({ text: "NT" });
    default:
      return getIucnColor({ text: "DD" });
  }
};
export const iucnScore = function (category) {
  if (["EX", "EW", "RE"].includes(category)) {
    return 1.0;
  } else if ("CR" === category) {
    return 0.99;
  } else if ("EN" === category) {
    return 0.91;
  } else if ("VU" === category) {
    return 0.77;
  } else if ("NT" === category) {
    return 0.55;
  } else if (["LC"].includes(category)) {
    return 0.52;
  } else {
    return -1;
  }
};
export const iucnScoreReverse = function (value) {
  if (value > 0.99) {
    return "EX";
  } else if (value > 0.91) {
    return "CR";
  } else if (value > 0.77) {
    return "EN";
  } else if (value > 0.55) {
    return "VU";
  } else if (value > 5.2) {
    return "NT";
  } else if (value > 0.0) {
    return "LC";
  } else if (value < 0) {
    return "DD";
  } else {
    return "DD";
  }
};
export const iucnCategories = {
  EX: "Extinct",
  EW: "Extinct in the Wild",
  CR: "Critical Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
  DD: "Data Deficient",
  NE: "Not Evaluated"
};

export const threatScore = function (danger) {
  switch (danger) {
    case "EX":
      return 1.0;
    case "TH":
      return 0.995;
    case "PT":
      return 0.5;
    case "nT":
      return 0.35;
    default:
      return -1;
  }
};
export const threatScoreReverse = function (value) {
  if (value > 0.995) {
    return "EX";
  } else if (value > 0.5) {
    return "TH";
  } else if (value > 0.35) {
    return "PT";
  } else if (value > 0) {
    return "nT";
  } else if (value < 0) {
    return "DD";
  } else {
    return "DD";
  }
};
