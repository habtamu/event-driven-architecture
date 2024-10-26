const fs = require("fs");
const path = require("path");
const { connect, sendToQueue, consumeQueue } = require("../rabbitmq");

const subscribers = {};

connect()
  .then(() => {
    console.log("RabbitMQ connection established ✅");
  })
  .catch((err) => {
    console.error(err);
  });

const invoke = async (name, data) => {
  sendToQueue(name, data).catch((err) => {
    console.error(`Error while invoking event`, { name, err });
  });
};

const subscribe = (event, executer) => {
  if (typeof executer !== "function") {
    throw new Error("Invalid subscriber");
  }

  const events = Array.isArray(event) ? event : [event];

  for (const eventName of events) {
    if (!subscribers[eventName]) {
      subscribers[eventName] = [];

      consumeQueue(eventName, async (message) => {
        for (const handler of subscribers[eventName]) {
          handler(message);
        }
      });
    }

    // Add the handler to the list of subscribers for the event
    subscribers[eventName].push(executer);
  }
};

const bindSubscribers = async () => {
  console.log("Binding subscribers...");

  await connect();

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
