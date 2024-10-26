const amqp = require("amqplib");

let channel;
let isConnected = false;

async function connect() {
  if (isConnected) return;

  try {
    const connection = await amqp.connect("amqp://guest:guest@localhost:5672");
    channel = await connection.createChannel();

    // Assert queues (e.g., "review-posted" and "review-reply") to make sure they exist
    await channel.assertQueue("review-posted", { durable: true });
    await channel.assertQueue("review-reply", { durable: true });

    isConnected = true;
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    throw new Error("Error while trying to connect to RabbitMQ");
  }
}

const sendToQueue = async (queue, message) => {
  if (!isConnected || !channel) {
    console.error("Channel not initialized. Call connect() first.");
    return;
  }

  try {
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } catch (error) {
    console.error("Failed to send message to queue:", error);
  }
};

const consumeQueue = async (queue, handler) => {
  if (!isConnected || !channel) {
    console.error("Channel not initialized. Call connect() first.");
    return;
  }

  try {
    await channel.consume(queue, async (msg) => {
      const messageContent = JSON.parse(msg.content.toString());

      await handler(messageContent);

      channel.ack(msg); // Acknowledge the message after processing
    });
  } catch (error) {
    console.error("Failed to consume messages:", error);
  }
};

module.exports = {
  connect,
  sendToQueue,
  consumeQueue,
};
