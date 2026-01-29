import "./chunk-G3PMV62Z.js";

// node_modules/ethiopian-calendar-date-converter/dist/ethiopian-calendar-date-converter.mjs
var l = (/* @__PURE__ */ new Date("December 9, 2012")).getTime() - (/* @__PURE__ */ new Date("April 1, 2005")).getTime();
var u = new Date(1900, 2, 1);
var f = new Date(2100, 1, 1);
function m(e) {
  return {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
  }[e];
}
function D(e) {
  return {
    1: "Meskerem ",
    2: "Tikimt ",
    3: "Hidar ",
    4: "Tahsas ",
    5: "Tir ",
    6: "Yekatit ",
    7: "Megabit ",
    8: "Meyazya ",
    9: "Ginbot ",
    10: "Sene ",
    11: "Hamle ",
    12: "Nehase ",
    13: "Pagume "
  }[e];
}
var d = class {
  year;
  month;
  date;
  hour;
  minute;
  second;
  constructor(t, n, a, o = 0, i = 0, r = 0) {
    if (a > 30) throw new Error(`Invalid Ethiopian Date: ${a}`);
    if (n < 1 || n > 13) throw new Error(`Invalid Ethiopian Month: ${n}`);
    this.year = t > 200 ? t : t + 1900, this.month = n, this.date = a, this.hour = o, this.minute = i, this.second = r;
  }
  static now() {
    const t = /* @__PURE__ */ new Date();
    return this.fromEuropeanDate(t);
  }
  static fromEuropeanDate(t) {
    return c(t);
  }
  toEuropeanDate() {
    return T(this);
  }
  toTimeString = () => this.hour < 13 ? s(this.hour) + ":" + s(this.minute) + ":" + s(this.second) + " a.m." : s(this.hour - 12) + ":" + s(this.minute) + ":" + s(this.second) + " p.m.";
  toDateString = () => D(this.month) + this.date + ", " + this.year;
  toDateWithDayString = () => `${m(this.getDay())}, ${this.toDateString()}`;
  toString = () => `${this.toDateString()}, ${this.toTimeString()}`;
  toFullDateTimeString = () => `${this.toString()}, ${m(this.getDay())} .`;
  getDay = () => (this.year + 2 * this.month + this.date + Y(this.year)) % 7;
};
function Y(e) {
  return -Math.floor((2023 - e) / 4);
}
function g(e) {
  return e >= u && e <= f;
}
function c(e) {
  if (!g(e))
    throw `Out of range input year: ${e.getFullYear()}`;
  const t = e.getTime() - new Date(Date.UTC(1971, 8, 12)).getTime(), n = Math.floor(t / 1262304e5);
  let a = Math.floor(
    (t - n * 1262304e5) / 31536e6
  );
  a === 4 && (a = 3);
  const o = Math.floor(
    (t - n * 1262304e5 - a * 31536e6) / (30 * 864e5)
  ), i = Math.floor(
    (t - n * 1262304e5 - a * 31536e6 - o * 30 * 864e5) / 864e5
  );
  let r = e.getHours();
  return r < 0 && (r += 24), new d(
    a + 4 * n + 1964,
    o + 1,
    i + 1,
    r,
    e.getMinutes(),
    e.getSeconds()
  );
}
function T(e) {
  const t = new Date(
    new Date(
      Date.UTC(e.year, e.month - 1, e.date)
    ).getTime() + l
  );
  if (e.month === 13) {
    let n;
    if (e.year % 4 === 3 ? n = 6 : n = 5, e.date > n)
      throw "Pagume Only has " + n + " days at year " + e.year + ". Please select another day.";
  }
  for (let n = -8; n < 9; n++) {
    const a = new Date(t.getTime() + n * 864e5), o = a.getTime() - new Date(Date.UTC(1971, 8, 12)).getTime(), i = Math.floor(o / 1262304e5);
    let r = Math.floor(
      (o - i * 1262304e5) / 31536e6
    );
    r === 4 && (r = 3);
    const h = Math.floor(
      (o - i * 1262304e5 - r * 31536e6) / (30 * 864e5)
    ), y = Math.floor(
      (o - i * 1262304e5 - r * 31536e6 - h * 30 * 864e5) / 864e5
    );
    if (e.date === y + 1 && e.month === h + 1) {
      if (!g(a))
        throw `Out of range input year: ${a.getFullYear()}`;
      return a;
    }
  }
  throw `Date not converted: ${e.year},  ${e.month},  ${e.date}, `;
}
function s(e, t = 2) {
  return String(e).padStart(t, "0");
}
var w = {
  ethiopianCalendarYear: {
    min: () => c(u).year,
    max: () => c(f).year
  },
  europeanCalendarDate: {
    min: u,
    max: f
  }
};
export {
  d as EthDateTime,
  w as limits
};
//# sourceMappingURL=ethiopian-calendar-date-converter.js.map
