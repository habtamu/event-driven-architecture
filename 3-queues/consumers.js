const PubSub = require("./pub-sub");

(async () => {
  await PubSub.bindSubscribers();
})();
