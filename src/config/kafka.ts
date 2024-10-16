import { Kafka, KafkaConfig, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types/broker";
import { Logger } from "winston";
import config from "config";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;

    constructor(
        clientId: string,
        brokers: string[],
        private logger: Logger,
    ) {
        let kafkaConfig: KafkaConfig = {
            clientId,
            brokers,
        };
        if (process.env.NODE_ENV === "production") {
            kafkaConfig = {
                ...kafkaConfig,
                ssl: true,
                connectionTimeout: 45000,
                sasl: {
                    mechanism: "plain",
                    username: config.get("kafka.sasl.username"),
                    password: config.get("kafka.sasl.password"),
                },
            };
        }
        const kafka = new Kafka(kafkaConfig);
        this.producer = kafka.producer();
    }

    /**
     * Connect the producer
     * @returns {Promise<void>}
     */
    async connect() {
        await this.producer.connect();
        this.logger.info("Connected to Kafka");
    }

    /**
     * Disconnect the producer
     */
    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
            this.logger.info("Disconnected from Kafka");
        }
    }
    /**
     *
     * @param topic - The topic to send the message to
     * @param message - The message to send
     * @throws {Error} - When the producer is not connected
     */
    async sendMessage(topic: string, message: string) {
        await this.producer.send({
            topic,
            messages: [{ value: message }],
        });
        this.logger.info("Message sent to Kafka", { topic, message });
    }
}
