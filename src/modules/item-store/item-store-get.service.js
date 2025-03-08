class ItemStoreGetService {

  static instance = null;

  constructor() {}

  static getInstance() {
      if (!ItemStoreGetService.instance) {
        ItemStoreGetService.instance = new ItemStoreGetService();
      }
      return ItemStoreGetService.instance;
    }

  async getItemQueryById(connection, itemId) {
      const [result] = await connection.query(
        'SELECT * FROM items WHERE id = ?',
        [itemId]
      );
  
      return result;
  }

  /**
   * @param {object} connection - The database connection.
   * @param {object} options - The filter options.
   * @param {string} [options.prefix] - The prefix to filter by.
   * @param {number} [options.typeId] - The type ID to filter by.
   * @returns {Promise<object[]>} A promise that resolves to an array of matching items.
   */
  async getItemByPrefixAndTypeId(connection, options) {
      const { prefix, typeId } = options;

      console.log(typeof typeId);
      
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

      console.log(query, values);
  
      const [result] = await connection.query(query, values);
      return result;
  }

  /**
   * Fetches items based on an array of type IDs and generates conditions for each with dynamic prefixes.
   * @param {object} connection - The database connection.
   * @param {number[]} inputArrayTypeIds - An array of type IDs to filter by.
   * @returns {Promise<object[]>} A promise that resolves to an array of matching items.
   * @throws Will throw an error if there are more than 26 elements in the typeIds array.
   */
  async getItemsByInputArrayTypeIds(connection, inputArrayTypeIds) {
    if (inputArrayTypeIds.length > 26) {
      throw new Error('Too many typeIds. The maximum allowed is 26 (A-Z).');
    }

    let query = 'SELECT * FROM items WHERE ';
    const conditions = [];
    const values = [];

    console.log(inputArrayTypeIds);

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
