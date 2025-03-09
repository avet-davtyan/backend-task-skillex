class ItemStoreCreateService {

  /**
   * @type {ItemStoreCreateService | null}
   */
  static instance = null;

  constructor() {}

  /**
   * @returns {ItemStoreCreateService}
   */
  static getInstance() {
    if (!ItemStoreCreateService.instance) {
      ItemStoreCreateService.instance = new ItemStoreCreateService();
    }
    return ItemStoreCreateService.instance;
  }
    
  /**
   * @typedef {Object} CreateItemOptions
   * @property {number} typeId
   * @property {string} prefix
   */

  /**
   * @typedef {Object} ItemQueryResult
   * @property {number} id
   * @property {number} typeId
   * @property {string} prefix
   */

  /**
   * @param {Connection} connection
   * @param {CreateItemOptions} options
   * @returns {Promise<ItemQueryResult>}
   */
  async createItemQuery(
      connection,
      options,
  ) {
    const {
      typeId,
      prefix,
    } = options;

    const [result] = await connection.query(
      'INSERT INTO items (type_id, prefix) VALUES (?, ?)',
      [typeId, prefix]
    );

    return {
      id: result.insertId,
      typeId,
      prefix,
    };
  }

  /**
   * @typedef {Object} CreateItemManyOptions
   * @property {number} typeId
   * @property {string} prefix
   */

  /**
   * @param {import('mysql2/promise').Connection} connection
   * @param {CreateItemManyOptions[]} optionsArray
   * @returns {Promise<null>}
   */
  async createItemManyQuery(
    connection,
    optionsArray,
  ) {
    const values = optionsArray.map(({ typeId, prefix }) => [typeId, prefix]);
    await connection.query(
        'INSERT INTO items (type_id, prefix) VALUES ?',
        [values]
    );

    return null;
  }
}

export default ItemStoreCreateService;
