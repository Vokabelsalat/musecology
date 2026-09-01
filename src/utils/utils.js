export function stringifyWithFunctions(object) {
  return JSON.stringify(object, (key, val) => {
    if (typeof val === "function") {
      return `(${val})`; // make it a string, surround it by parenthesis to ensure we can revive it as an anonymous function
    }
    return val;
  });
}

export function parseWithFunctions(obj) {
  return JSON.parse(obj, (k, v) => {
    if (typeof v === "string" && v.indexOf("function") >= 0) {
      return eval(v);
    }
    return v;
  });
}

export const colorBrewerScheme8 = [
  "rgb(166,206,227)",
  "rgb(31,120,180)",
  "rgb(178,223,138)",
  "rgb(51,160,44)",
  "rgb(251,154,153)",
  "rgb(227,26,28)",
  "rgb(253,191,111)",
  "rgb(255,127,0)"
];

export const dangerColorMap = {
  EX: { bg: "rgba(214, 0, 3, 1)", fg: "rgb(255,255,255)" },
  TH: { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
  PT: { bg: "rgb(249,232,18)", fg: "rgb(0,0,0)" },
  nT: { bg: "rgb(97,198,89)", fg: "rgb(0,0,0)" },
  DD: { bg: "rgb(209,209,198)", fg: "rgb(0,0,0)" }
};

export const getGroupFileAndRotationFromID = function (id) {
  let group = "";
  let filename = "";
  let rotation = 0;

  switch (id) {
    case "Strings":
      group = "Strings";
      filename = "strings2.svg";
      break;
    case "Woodwinds":
      group = "Woodwinds";
      filename = "woodwinds.svg";
      rotation = 80;
      break;
    case "Percussion":
      group = "Percussion";
      filename = "percussion2.svg";
      break;
    case "Plucked":
      group = "Plucked";
      filename = "plucked2.svg";
      break;
    case "Keyboard":
      group = "Keyboard";
      filename = "keyboard2.svg";
      break;
    case "Brasses":
      group = "Brasses";
      filename = "brasses2.svg";
      break;
    default:
      // statements_def
      break;
  }

  return { group, filename, rotation };
};

export const replaceAll = function (string, search, replacement) {
  return string.replace(new RegExp(search, "g"), replacement);
};
export const replaceSpecialCharacters = function (string) {
  return string.replace(/[ &\/\\#,+()$~%.'":*?<>{}|]/g, "_");
};
export const serializeXmlNode = function (xmlNode) {
  if (typeof window.XMLSerializer != "undefined") {
    return new window.XMLSerializer().serializeToString(xmlNode);
  } else if (typeof xmlNode.xml != "undefined") {
    return xmlNode.xml;
  }
  return "";
};
export const rgbToRGBA = function (rgbString, alpha) {
  try {
    // statements
    return rgbString.replace(")", "," + alpha + ")");
  } catch (e) {
    // statements
    /*console.log(e);*/
    return rgbString;
  }
};
export const scaleValue = function (value, from, to) {
  var scale = (to[1] - to[0]) / (from[1] - from[0]);
  var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return ~~(capped * scale + to[0]);
};
export const pushOrCreate = function (obj, key, value) {
  if (Object.keys(obj).includes(key)) {
    obj[key].push(value);
  } else {
    obj[key] = [value];
  }
  return obj;
};
export const pushOrCreateWithoutDuplicates = function (obj, key, value) {
  if (Object.keys(obj).includes(key)) {
    if (obj[key].indexOf(value) < 0) {
      obj[key].push(value);
    }
  } else {
    obj[key] = [value];
  }
  return obj;
};
export const getOrCreate = function (obj, key, set) {
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  } else {
    obj[key] = set;
    return obj[key];
  }
};
export const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};
export const threatenedToDangerMap = {
  extinct: "EX",
  threatened: "TH",
  "possibly threatened": "PT",
  "not threatened": "nT",
  "data deficient": "DD"
};
export const sourceToDangerMap = {
  I: "EX",
  W: "TH",
  A: "nT",
  O: "nT",
  D: "PT",
  Y: "PT",
  U: "DD"
};
export const iucnToDangerMap = {
  EX: "EX",
  EW: "EX",
  RE: "EX",
  CR: "TH",
  EN: "TH",
  VU: "PT",
  NT: "nT",
  LC: "nT",
  DD: "DD",
  NA: "DD",
  NE: "DD"
};
export const dangerToIUCNMap = {
  EX: "EX",
  EX: "EW",
  EX: "RE",
  TH: "CR",
  TH: "EN",
  PT: "VU",
  nT: "NT",
  nT: "LC",
  DD: "DD",
  DD: "NA",
  DD: "NE"
};
export const getThreatColor = function (d) {
  if (dangerColorMap.hasOwnProperty(d)) {
    return dangerColorMap[d].bg;
  } else {
    return dangerColorMap["DD"].bg;
  }
};
export const dangerSorted = ["DD", "nT", "PT", "TH", "EX"];
export const colorBrewerScheme14Qualitative = [
  "rgb(141,211,199)",
  "rgb(255,255,179)",
  "rgb(190,186,218)",
  "rgb(251,128,114)",
  "rgb(128,177,211)",
  "rgb(253,180,98)",
  "rgb(179,222,105)",
  "rgb(252,205,229)",
  "rgb(217,217,217)",
  "rgb(188,128,189)",
  "rgb(204,235,197)",
  "rgb(255,237,111)",
  "rgb(150,150,150)",
  "rgb(0,0,0)"
];
export const watermarkColorSheme = [
  "rgb(0, 119, 68)",
  "rgb(188, 174, 70)",
  "rgb(157, 196, 85)",
  "rgb(34, 106, 90)",
  "rgb(0, 103, 115)",
  "rgb(136, 180, 149)",
  "rgb(234, 157, 64)",
  "rgb(247, 208, 66)",
  "rgb(114, 191, 179)",
  "rgb(191, 157, 117)",
  "rgb(188, 213, 148)",
  "rgb(210, 37, 49)",
  "rgb(217, 117, 96)",
  "rgb(212, 29, 113"
];
