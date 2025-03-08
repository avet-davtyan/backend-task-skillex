import CombinationStoreCreateService from "../combination-store/combination-store-create.service.js";
import ItemStoreCreateService from "../item-store/item-store-create.service.js";
import ItemStoreGetService from "../item-store/item-store-get.service.js";
import ResponseStoreCreateService from "../response-store/response-store-create.service.js";
import { getConnection } from "../../db/connection.js";

function combine(arr, index, combination, length, items) {
  if (arr.length === length) {
    combination.push(arr);
    return;
  }

  for (let i = index; i < items.length; i++) {
    for (let j = 0; j < items[i].length; j++) {
      combine([...arr, items[i][j]], i + 1, combination, length, items);
    }
  }
}

class CombinationService {

  static instance = null;

  constructor() {
    this.combinationStoreCreateService = CombinationStoreCreateService.getInstance();
    this.responseStoreCreateService = ResponseStoreCreateService.getInstance();
    this.itemStoreCreateService = ItemStoreCreateService.getInstance();
    this.itemStoreGetService = ItemStoreGetService.getInstance();
  }

  static getInstance() {
      if (!CombinationService.instance) {
        CombinationService.instance = new CombinationService();
      }
      return CombinationService.instance;
    }
  
  async generateAndSaveCombination(
      options,
  ) {
    const{
      inputArray,
      length,
    } = options;
  
    const connection = await getConnection();

    try {
      await connection.beginTransaction();
      const existingItems =
        await this.itemStoreGetService.getItemsByInputArrayTypeIds(connection, inputArray);
  
      const allItems = [];
      const missingItems = [];
      for (let i = 0; i < inputArray.length; i++) {
        const prefix = String.fromCharCode(65 + i);
        const currentMaxTypeId = inputArray[i];
        const itemGroup = [];
        for (let typeId = 1; typeId <= currentMaxTypeId; typeId++) {
          if (existingItems.find(item => item.type_id === typeId && item.prefix === prefix) === undefined) {
            missingItems.push({ prefix, typeId });
          }
          itemGroup.push(prefix + typeId);
        }
        allItems.push(itemGroup);
      }
  
      if (missingItems.length !== 0) {
        await this.itemStoreCreateService.createItemManyQuery(connection, missingItems);
      }
  
      const combination = [];
      combine([], 0, combination, length, allItems);

      const createdCombination = await this.combinationStoreCreateService.createCombinationQuery(connection, {
        combination,
      });
      await this.responseStoreCreateService.createResponseQuery(connection, {
        inputArray: options,
        combinationId: createdCombination.id,
      });

      await connection.commit();

      return createdCombination;
    } catch (error) {
      console.error("Error fetching item", error);
      await connection.rollback();
      throw error;
    }
  }
}

export default CombinationService;
