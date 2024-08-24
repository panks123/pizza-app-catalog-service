import config from "config";
import { KafkaProducerBroker } from "../../config/kafka";
import { MessageProducerBroker } from "../types/broker";
import logger from "../../config/logger";

let messageProducer: MessageProducerBroker | null = null;

export const createProducerBroker = (): MessageProducerBroker => {
    // making singleton
    if (!messageProducer) {
        messageProducer = new KafkaProducerBroker(
            "catalog-service",
            [config.get("kafka.broker")],
            logger,
        );
    }
    return messageProducer;
};
