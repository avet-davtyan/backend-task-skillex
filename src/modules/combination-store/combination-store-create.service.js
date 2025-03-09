class CombinationStoreCreateService {

  /**
   * @type {CombinationStoreCreateService | null}
   */
  static instance = null;

  constructor() {}

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
   * @property {string[][]} combination
   */

  /**
   * @typedef {Object} CombinationQueryResult
   * @property {number} id
   * @property {string[][]} combination
   */

  /**
   * @param {import('mysql2/promise').Connection} connection
   * @param {CombinationQueryOptions} options
   * @returns {Promise<CombinationQueryResult>}
   */
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
