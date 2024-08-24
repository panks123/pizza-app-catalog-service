import { Kafka, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types/broker";
import { Logger } from "winston";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;

    constructor(
        clientId: string,
        brokers: string[],
        private logger: Logger,
    ) {
        const kafka = new Kafka({
            clientId,
            brokers,
        });
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
