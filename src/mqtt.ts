import * as mqtt from "mqtt"; // import everything inside the mqtt module and give it the namespace "mqtt"

let client = mqtt.connect("mqtt://zstu-interaction.art"); // create a client

client.on("connect", function () {
  client.subscribe("word/create", function (err) {
    if (!err) {
      client.publish("word/create", "word/create");
    }
  });
});

client.on("message", function (topic, message) {
  // message is Buffer
  console.log(topic.toString(), message.toString());
  client.end();
});

export class MqttClient {
  client: mqtt.MqttClient;
  constructor(mqttAddress: string) {
    this.client = mqtt.connect(mqttAddress);
    this.client.on("connect", function () {
      client.subscribe("word/create", function (err) {
        if (!err) {
          client.publish("word/create", "word/create");
        }
      });
    });

    this.client.on("message", function (topic, message) {
      // message is Buffer
      console.log(topic.toString(), message.toString());
      client.end();
    });
  }
}
