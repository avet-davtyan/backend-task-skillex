import { getConnection } from '../../db/connection.js';

class CombinationStoreCreateService {
    constructor() {
        if (CombinationStoreCreateService.instance) {
            return CombinationStoreCreateService.instance;
        }
        this.initializeConnection();
        CombinationStoreCreateService.instance = this;
    }

    async initializeConnection() {
        this.connection = await getConnection();
    }

    async createCombination(combination) {
        try {
            await this.connection.beginTransaction();

            const [result] = await this.connection.query(
                'INSERT INTO combinations (combination) VALUES (?)',
                [JSON.stringify(combination)]
            );

            await this.connection.commit();

            return {
                id: result.insertId,
                combination
            };
        } catch (error) {
            await this.connection.rollback();
            console.error("Error creating combination");
        }
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.end();
        }
    }
}

const combinationStoreCreateService = Object.freeze(new CombinationStoreCreateService());

export default combinationStoreCreateService;
