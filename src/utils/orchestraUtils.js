module.exports = {
  getStartAndEnd(path) {
    try {
      let split = path.split(" ");
      return {
        start: { x: parseInt(split[1]), y: parseInt(split[2]) },
        end: { x: parseInt(split[9]), y: parseInt(split[10]) }
      };
      // statements
    } catch (e) {
      //console.log(e);
      return null;
    }
  },

  getAngle(x1, y1, x2, y2) {
    var dx = x1 - x2,
      dy = y1 - y2;

    return -1 * ((Math.atan2(dy, dx) * 180) / Math.PI - 180);
  },

  calculatePath(x, y, options) {
    const { width, strokeWidth, start, end } = options;
    const upper = module.exports.describeArc(
      x,
      y,
      width + strokeWidth / 2,
      start,
      end,
      1
    );

    const lower = module.exports.describeArc(
      x,
      y,
      width - strokeWidth / 2,
      start,
      end,
      0,
      true
    );

    return [upper, lower, "Z"].join(" ");
  },

  getDistance(x1, y1, x2, y2) {
    let sum = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return Math.sqrt(sum);
  },

  calcMidPointOfArc(x, y, radius, startAngle, endAngle, ratio = 0.5) {
    const newAngle = endAngle - (endAngle - startAngle) * ratio;
    var mid = module.exports.polarToCartesian(x, y, radius, newAngle);

    return mid;
  },

  describeArc(
    x,
    y,
    radius,
    startAngle,
    endAngle,
    direction = 0,
    withoutM = false
  ) {
    var start = module.exports.polarToCartesian(x, y, radius, endAngle);
    var end = module.exports.polarToCartesian(x, y, radius, startAngle);

    if (direction === 0) {
      let tmp = start;
      start = end;
      end = tmp;
    }

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    let d;
    if (withoutM) {
      d = [
        "L",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        direction,
        end.x,
        end.y
      ].join(" ");
    } else {
      d = [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        direction,
        end.x,
        end.y
      ].join(" ");
    }

    return d;
  },

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  },

  calcArcLength(r, strokewidth, textlength, angle) {
    return Math.PI * r * (angle / 180) - textlength;
  },

  getParent(sel) {
    return sel.select(function () {
      return this.parentNode;
    });
  }
};
