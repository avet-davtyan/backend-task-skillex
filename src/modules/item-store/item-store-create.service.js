class ItemStoreCreateService {

    static instance = null;

    constructor() {}

    static getInstance() {
        if (!ItemStoreCreateService.instance) {
          ItemStoreCreateService.instance = new ItemStoreCreateService();
        }
        return ItemStoreCreateService.instance;
      }
    
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

        return result;
    }
}

export default ItemStoreCreateService;
