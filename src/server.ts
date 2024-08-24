import config from "config";
import app from "./app";
import logger from "./config/logger";
import { initDb } from "./config/db";
import { MessageProducerBroker } from "./common/types/broker";
import { createProducerBroker } from "./common/factories/broker-factory";

const startServer = async () => {
    const PORT: number = config.get("server.port") || 5502;
    let messageProducerBroker: MessageProducerBroker | null = null;
    try {
        await initDb();
        logger.info("Database connected succefully!");

        // Connect to Kafka
        // messageProducerBroker = new KafkaProducerBroker('catalog-service', [config.get('kafka.broker')]);
        messageProducerBroker = createProducerBroker();
        await messageProducerBroker.connect();

        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (messageProducerBroker) {
                await messageProducerBroker.disconnect();
            }
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
