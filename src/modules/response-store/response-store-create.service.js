class ResponseStoreCreateService {

  /**
   * @type {ResponseStoreCreateService | null}
   */
  static instance = null;

  constructor() { }

  /**
   * @returns {ResponseStoreCreateService}
   */
  static getInstance() {
    if (!ResponseStoreCreateService.instance) {
      ResponseStoreCreateService.instance = new ResponseStoreCreateService();
    }
    return ResponseStoreCreateService.instance;
  }

  /**
   * @typedef {Object} RequestData
   * @property {Array<number>} inputArray
   * @property {number} length
   */

  /**
   * @typedef {Object} CreateResponseOptions
   * @property {RequestData} requestData
   * @property {number} combinationId
   */

  /**
   * @typedef {Object} ResponseQueryResult
   * @property {number} id
   * @property {RequestData} requestData
   * @property {number} combinationId
   */

  /**
   * @param {import("mysql2/promise").Connection} connection
   * @param {CreateResponseOptions} options
   * @returns {Promise<ResponseQueryResult>}
   */
  async createResponseQuery(
    connection,
    options,
  ) {
    const {
      requestData,
      combinationId,
    } = options;

    const [result] = await connection.query(
      "INSERT INTO responses (request_data, combination_id) VALUES (?, ?)",
      [JSON.stringify(requestData), combinationId]
    );

    return {
      id: result.insertId,
      requestData,
      combinationId,
    };
  }
}

export default ResponseStoreCreateService;
