class ItemStoreGetService {

  /**
   * @type {ItemStoreGetService | null}
   */
  static instance = null;

  constructor() {}

  /**
   * @returns {ItemStoreGetService}
   */
  static getInstance() {
    if (!ItemStoreGetService.instance) {
      ItemStoreGetService.instance = new ItemStoreGetService();
    }
    return ItemStoreGetService.instance;
  }

  /**
   * @typedef {Object} GetItemResult
   * @property {number} id
   * @property {number} type_id
   * @property {string} prefix
   */

  /**
   * @param {import('mysql2/promise').Connection} connection
   * @param {number} itemId
   * @returns {Promise<GetItemResult[]>}
   */
  async getItemQueryById(connection, itemId) {
    const [result] = await connection.query(
      'SELECT * FROM items WHERE id = ?',
      [itemId]
    );
  
    return result;
  }

  /**
   * @typedef {Object} GetItemOptions
   * @property {number} typeId
   * @property {string} prefix
   */

  /**
   * @param {Connection} connection
   * @param {GetItemOptions} options
   * @returns {Promise<GetItemResult[]>}
   */
  async getItemByPrefixAndTypeId(connection, options) {
    const { prefix, typeId } = options;

    let query = 'SELECT * FROM items';
    const conditions = [];
    const values = [];
  
    if (prefix !== undefined) {
      conditions.push('prefix = ?');
      values.push(prefix);
    }
  
    if (typeId !== undefined) {
      conditions.push('type_id = ?');
      values.push(typeId);
    }
  
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [result] = await connection.query(query, values);
    return result;
  }

  /**
   * @param {Connection} connection
   * @param {number[]} inputArrayTypeIds
   * @returns {Promise<GetItemResult[]>}
   */
  async getItemsByInputArrayTypeIds(connection, inputArrayTypeIds) {
    if (inputArrayTypeIds.length > 26) {
      throw new Error('Too many typeIds. The maximum allowed is 26 (A-Z).');
    }

    let query = 'SELECT * FROM items WHERE ';
    const conditions = [];
    const values = [];

    inputArrayTypeIds.forEach((typeId, index) => {
      const prefix = String.fromCharCode(65 + index); 

      conditions.push(`(prefix = ? AND type_id <= ?)`);
      values.push(prefix, typeId);
    });

    query += conditions.join(' OR ');

    const [result] = await connection.query(query, values);
    return result;
  }
}

export default ItemStoreGetService;
