class ResponseStoreCreateService {

    static instance = null;

    constructor() {}

    static getInstance() {
        if (!ResponseStoreCreateService.instance) {
          ResponseStoreCreateService.instance = new ResponseStoreCreateService();
        }
        return ResponseStoreCreateService.instance;
      }
    
    async createResponseQuery(
        connection,
        options,
    ) {
        const {
            inputArray,
            combinationId,
        } = options;

        const [result] = await connection.query(
            'INSERT INTO responses (request_data, combination_id) VALUES (?, ?)',
            [JSON.stringify(inputArray), combinationId]
        );

        return result;
    }
}

export default ResponseStoreCreateService;
