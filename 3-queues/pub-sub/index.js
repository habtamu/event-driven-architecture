const fs = require("fs");
const path = require("path");
const { createClient } = require("redis");

let redisPublisher;
let redisSubscriber;

(function connectToRedis() {
  try {
    redisPublisher = createClient();
    redisSubscriber = createClient();

    redisPublisher.connect();
    redisSubscriber.connect();
  } catch (err) {
    console.error("Error while trying to connect to Redis: ", err);
  }
})();

const invoke = async (name, data) => {
  const message = JSON.stringify(data);

  redisPublisher.publish(name, message).catch((err) => {
    console.error(`Error while invoking event`, { name, err });
  });
};

const subscribe = (event, executer) => {
  if (typeof executer !== "function") {
    throw new Error("Invalid subscriber");
  }

  const events = Array.isArray(event) ? event : [event];

  for (const eventName of events) {
    redisSubscriber.subscribe(eventName, (message) => {
      const data = JSON.parse(message);
      executer(data);
    });
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
