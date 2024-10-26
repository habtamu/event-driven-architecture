const fs = require("fs");
const path = require("path");

const subscribers = {};

const invoke = (name, data) => {
  const subs = subscribers[name] || [];

  const subscribersFunctions = subs.map((sub) => {
    return new Promise((resolve) => {
      try {
        sub(data);
      } catch (error) {
        console.error(`Error while executing subscriber`, {
          eventName: name,
          error,
        });
      } finally {
        resolve();
      }
    });
  });

  Promise.all(subscribersFunctions);
};

const subscribe = (event, executer) => {
  if (typeof executer !== "function") {
    throw new Error("Invalid subscriber");
  }

  const events = Array.isArray(event) ? event : [event];

  for (const eventName of events) {
    subscribers[eventName] = subscribers[eventName] || [];
    subscribers[eventName].push(executer);
  }
};

const bindSubscribers = () => {
  console.log("Binding subscribers...");

  const subscribersDir = path.join(__dirname, "../", "subscribers");

  fs.readdirSync(subscribersDir).forEach((file) => {
    require(path.join(subscribersDir, file));
  });

  console.log("🔗 Subscribers bound");
};

module.exports = {
  invoke,
  subscribe,
  bindSubscribers,
};
