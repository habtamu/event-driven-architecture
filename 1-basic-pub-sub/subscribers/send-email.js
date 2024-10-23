import PubSub from "../pub-sub/index.js";

PubSub.subscribe("review-posted", (data) => {
  console.log("Sending a thank you email for reviewer!", data);
});
