import { Injectable, OnModuleInit } from "@nestjs/common";
import { MqttClient, connect } from "mqtt";
import { KioskService } from "src/kiosks/kiosk.service";
import { Transaction } from "src/types/transaction";
import { MQTT_TOPICS } from "./topics";
@Injectable()
export class MqttService implements OnModuleInit {
  private mqttClient: MqttClient;
  constructor(
    private kioskService: KioskService
  ) { }

  onModuleInit() {
  
    const host = process.env.MQTT_HOST;
    const port = process.env.MQTT_PORT;
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
    const connectUrl = `mqtt://${host}:${port}`;

    const subscribeIntialTopics = () => {
      this.subscribe(MQTT_TOPICS.transaction);
      this.subscribe(MQTT_TOPICS.status);
    };

    this.mqttClient = connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on("connect", function (a) {
      console.info("Connected to CloudMQTT");
      subscribeIntialTopics();
    });

    this.mqttClient.on("error", function (e) {
      console.error("Error in connecting to CloudMQTT", e);
    });

    this.mqttClient.on("message", async (topic, message, packet) => {
      try {
        const data = JSON.parse(message.toString());
        switch (topic) {
          case MQTT_TOPICS.transaction:
            await this.kioskService.addTransaction(data);
            break;
          case MQTT_TOPICS.status:
            await this.kioskService.updateStatus(data);
            break;
        }
      } catch (error) {
        console.log(`error: ${error}`);
      }
    });
  }
  
  subscribe(topic: string) {
    console.info(`Subscribing to ${topic}`);
    this.mqttClient.subscribe(topic);
  }

  publish(topic: string, message: string) {
    console.info(`Publishing to ${topic}`);
    this.mqttClient.publish(topic, message);
  }

}
