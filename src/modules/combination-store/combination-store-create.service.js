class CombinationStoreCreateService {

    static instance = null;

    constructor() {}

    static getInstance() {
        if (!CombinationStoreCreateService.instance) {
          CombinationStoreCreateService.instance = new CombinationStoreCreateService();
        }
        return CombinationStoreCreateService.instance;
      }
    
    async createCombinationQuery(
        connection,
        options,
    ) {
        const {
            combination,
        } = options;

        const [result] = await connection.query(
            'INSERT INTO combinations (combination) VALUES (?)',
            [JSON.stringify(combination)]
        );

        return {
            id: result.insertId,
            combination,
        };
    }
}

export default CombinationStoreCreateService;
