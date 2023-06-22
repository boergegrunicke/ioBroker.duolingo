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
    try {
      const response = await import_axios.default.get("https://www.duolingo.com/api/1/version_info", {
        headers: { "User-Agent": this.USER_AGENT }
      });
      if (response.status == 200) {
        await this.createStates();
        this.setState("country", { val: response.data.country, ack: true });
        this.setState("age_restriction_limit", { val: response.data.age_restriction_limit, ack: true });
      }
      const userResponse = await import_axios.default.get(`https://www.duolingo.com/users/${this.config.username}`, {
        headers: { "User-Agent": this.USER_AGENT, Authorization: `Bearer ${this.config.jwt}` }
      });
      if (userResponse.status == 200) {
        const username = userResponse.data.username.toString().replace(".", "_");
        this.createStatesForUsername(username);
        this.setState(`${username}.learning_language`, {
          val: userResponse.data.learning_language_string,
          ack: true
        });
        this.setState(`${username}.email`, { val: userResponse.data.email, ack: true });
        this.setState(`${username}.fullname`, { val: userResponse.data.fullname, ack: true });
        this.setState(`${username}.streak_extended_today`, {
          val: userResponse.data.streak_extended_today,
          ack: true
        });
        this.setState(`${username}.daily_goal`, { val: userResponse.data.daily_goal, ack: true });
        this.setState(`${username}.id`, { val: userResponse.data.id, ack: true });
        this.setState(`${username}.streak`, { val: userResponse.data.site_streak, ack: true });
        const todayElements = userResponse.data.calendar.filter(
          (element) => this.isTimestampFromDay(element.datetime, 0)
        );
        const yesterdayElements = userResponse.data.calendar.filter(
          (element) => this.isTimestampFromDay(element.datetime, 1)
        );
        let todayPoints = 0;
        todayElements.forEach((element) => {
          todayPoints += element.improvement;
        });
        let yesterdayPoints = 0;
        yesterdayElements.forEach((element) => {
          yesterdayPoints += element.improvement;
        });
        this.setState(`${username}.today.exercises`, { val: todayElements.length, ack: true });
        this.setState(`${username}.today.points`, { val: todayPoints, ack: true });
        this.setState(`${username}.yesterday.exercises`, { val: yesterdayElements.length, ack: true });
        this.setState(`${username}.yesterday.points`, { val: yesterdayPoints, ack: true });
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
  isTimestampFromDay(timestamp, correction) {
    const date = new Date(timestamp);
    const currentDate = new Date();
    if (date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth() && date.getDate() === currentDate.getDate() - correction) {
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
