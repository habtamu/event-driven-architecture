const PubSub = require("../pub-sub/index.js");

PubSub.subscribe(["review-posted", "review-reply"], (data) => {
  console.log(`Audit: `, data);
});
