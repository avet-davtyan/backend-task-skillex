import { getConnection } from '../../db/connection.js';

class ResponseStoreCreateService {
    constructor() {
        if (ResponseStoreCreateService.instance) {
            return ResponseStoreCreateService.instance;
        }
        this.initializeConnection();
        ResponseStoreCreateService.instance = this;
    }

    async initializeConnection() {
        this.connection = await getConnection();
    }

    async createResponse(response) {
        try {
            await this.connection.beginTransaction();

            const [result] = await this.connection.query(
                'INSERT INTO responses (response_data) VALUES (?)',
                [JSON.stringify(response)]
            );

            await this.connection.commit();

            return {
                id: result.insertId,
                response
            };
        } catch (error) {
            await this.connection.rollback();
            console.error("Error creating response");
        }
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

const responseStoreCreateService = Object.freeze(new ResponseStoreCreateService());

export default responseStoreCreateService;
