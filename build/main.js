"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var import_axios = __toESM(require("axios"));
class Duolingo extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "duolingo"
    });
    this.USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";
    this.on("ready", this.onReady.bind(this));
    this.on("unload", this.onUnload.bind(this));
  }
  async onReady() {
    await this.createStates();
    try {
      const response = await import_axios.default.get("https://www.duolingo.com/api/1/version_info", {
        headers: { "User-Agent": this.USER_AGENT }
      });
      if (response.status == 200) {
        this.setState("country", response.data.country);
        this.setState("age_restriction_limit", response.data.age_restriction_limit);
      }
      const userResponse = await import_axios.default.get(`https://www.duolingo.com/users/${this.config.username}`, {
        headers: { "User-Agent": this.USER_AGENT, Authorization: `Bearer ${this.config.jwt}` }
      });
      this.log.info("result : " + userResponse.status + " - " + userResponse.statusText);
      if (userResponse.status == 200) {
        this.log.info("OK");
        const username = userResponse.data.username.toString().replace(".", "_");
        this.createStatesForUsername(username);
        this.setState(`${username}.learning_language`, userResponse.data.learning_language_string);
        this.setState(`${username}.email`, userResponse.data.learning_language_string);
        this.setState(`${username}.fullname`, userResponse.data.fullname);
        this.setState(`${username}.streak_extended_today`, userResponse.data.streak_extended_today);
        this.setState(`${username}.daily_goal`, userResponse.data.daily_goal);
        this.setState(`${username}.id`, userResponse.data.id);
        this.setState(`${username}.streak`, userResponse.data.site_streak);
        this.log.info("calendar-elements : " + userResponse.data.calendar.length);
        const todayElements = userResponse.data.calendar.filter(
          (element) => this.isTimestampFromToday(element.datetime)
        );
        const yesterdayElements = userResponse.data.calendar.filter(
          (element) => this.isTimestampFromYesterday(element.datetime)
        );
        let todayPoints = 0;
        todayElements.forEach((element) => {
          todayPoints += element.improvement;
        });
        let yesterdayPoints = 0;
        yesterdayElements.forEach((element) => {
          yesterdayPoints += element.improvement;
        });
        this.setState(`${username}.today.exercises`, todayElements.length);
        this.setState(`${username}.today.points`, todayPoints);
        this.setState(`${username}.yesterday.exercises`, yesterdayElements.length);
        this.setState(`${username}.yesterday.points`, yesterdayPoints);
        this.log.info("is today today ? " + this.isTimestampFromToday(new Date().getTime()));
      }
    } catch (exception) {
      this.log.error("error : " + exception);
    }
  }
  async createStates() {
    await this.setObjectNotExistsAsync("country", {
      type: "state",
      common: {
        name: "API-Country",
        type: "string",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync("age_restriction_limit", {
      type: "state",
      common: {
        name: "Age restriction limit",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
  }
  async createStatesForUsername(username) {
    await this.setObjectNotExistsAsync(`${username}.learning_language`, {
      type: "state",
      common: {
        name: "Learning language",
        type: "string",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.streak_extended_today`, {
      type: "state",
      common: {
        name: "Streak extended todayy",
        type: "boolean",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.email`, {
      type: "state",
      common: {
        name: "E-Mail",
        type: "string",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.fullname`, {
      type: "state",
      common: {
        name: "Fullname",
        type: "string",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.daily_goal`, {
      type: "state",
      common: {
        name: "Daily goal",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.id`, {
      type: "state",
      common: {
        name: "ID",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.streak`, {
      type: "state",
      common: {
        name: "Streak",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.today.exercises`, {
      type: "state",
      common: {
        name: "Exercises today",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.today.points`, {
      type: "state",
      common: {
        name: "Points today",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.yesterday.exercises`, {
      type: "state",
      common: {
        name: "Exercises yesterday",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
    await this.setObjectNotExistsAsync(`${username}.yesterday.points`, {
      type: "state",
      common: {
        name: "Points yesterday",
        type: "number",
        role: "indicator",
        read: true,
        write: false
      },
      native: {}
    });
  }
  isTimestampFromToday(timestamp) {
    const date = new Date(timestamp);
    const currentDate = new Date();
    if (date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth() && date.getDate() === currentDate.getDate()) {
      return true;
    }
    return false;
  }
  isTimestampFromYesterday(timestamp) {
    const date = new Date(timestamp);
    const currentDate = new Date();
    if (date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth() && date.getDate() === currentDate.getDate() - 1) {
      return true;
    }
    return false;
  }
  onUnload(callback) {
    try {
      callback();
    } catch (e) {
      callback();
    }
  }
}
if (require.main !== module) {
  module.exports = (options) => new Duolingo(options);
} else {
  (() => new Duolingo())();
}
//# sourceMappingURL=main.js.map
