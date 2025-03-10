class CombinationStoreCreateService {

  /**
   * @type {CombinationStoreCreateService | null}
   */
  static instance = null;

  constructor() { }

  /**
   * @returns {CombinationStoreCreateService}
   */
  static getInstance() {
    if (!CombinationStoreCreateService.instance) {
      CombinationStoreCreateService.instance = new CombinationStoreCreateService();
    }
    return CombinationStoreCreateService.instance;
  }


  /**
   * @typedef {Object} CombinationQueryOptions
   * @property {string[][]} combinationList
   */

  /**
   * @typedef {Object} CombinationQueryResult
   * @property {number} id
   * @property {string[][]} combinationList
   */

  /**
   * @param {import("mysql2/promise").Connection} connection
   * @param {CombinationQueryOptions} options
   * @returns {Promise<CombinationQueryResult>}
   */
  async createCombinationQuery(
    connection,
    options,
  ) {
    const {
      combinationList,
    } = options;

    const [result] = await connection.query(
      "INSERT INTO combinations (combination) VALUES (?)",
      [JSON.stringify(combinationList)]
    );

    return {
      id: result.insertId,
      combinationList,
    };
  }
}

export default CombinationStoreCreateService;
