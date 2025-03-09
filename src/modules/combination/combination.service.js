import CombinationStoreCreateService from "../combination-store/combination-store-create.service.js";
import ItemStoreCreateService from "../item-store/item-store-create.service.js";
import ItemStoreGetService from "../item-store/item-store-get.service.js";
import ResponseStoreCreateService from "../response-store/response-store-create.service.js";
import { getConnection } from "../../db/connection.js";

/**
 * 
 * @param {Array<string>} arr 
 * @param {number} index 
 * @param {Array<Array<string>>} combination 
 * @param {number} length 
 * @param {Array<Array<string>>} items 
 * @returns 
 */
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

  /**
   * @type {CombinationService | null}
   */
  static instance = null;

  constructor() {
    this.combinationStoreCreateService = CombinationStoreCreateService.getInstance();
    this.responseStoreCreateService = ResponseStoreCreateService.getInstance();
    this.itemStoreCreateService = ItemStoreCreateService.getInstance();
    this.itemStoreGetService = ItemStoreGetService.getInstance();
  }

  /** 
   * @returns {CombinationService}
   */
  static getInstance() {
    if (!CombinationService.instance) {
      CombinationService.instance = new CombinationService();
    }
    return CombinationService.instance;
  }

  /**
   * @typedef {Object} GenerateCombinationOptions
   * @property {number[]} inputArray
   * @property {number} length
   */

  /**
   * @typedef {Object} CombinationInternal
   * @property {number} id
   * @property {string[][]} combination
   */

  /**
   * 
   * @param {GenerateCombinationOptions} options 
   * @returns {Promise<CombinationInternal>} 
   */
  async generateAndSaveCombination(
      options,
  ) {
    const {
      inputArray,
      length,
    } = options;
  
    const connection = await getConnection();

    try {
      await connection.beginTransaction();
      const existingItems =
        await this.itemStoreGetService.getItemsByInputArrayTypeIds(connection, inputArray);

      const combinationGenerationAssets = this.loadGenerateCombinationAssets({
        existingItems,
        inputArray,
      });

      const {
        allItems,
        missingItems,
      } = combinationGenerationAssets;

      if (missingItems.length !== 0) {
        await this.itemStoreCreateService.createItemManyQuery(connection, missingItems);
      }
  
      const combination = [];
      combine([], 0, combination, length, allItems);

      const createdCombination = await this.combinationStoreCreateService.createCombinationQuery(connection, {
        combination,
      });
      await this.responseStoreCreateService.createResponseQuery(connection, {
        requestData: options,
        combinationId: createdCombination.id,
      });

      await connection.commit();

      return createdCombination;
    } catch (error) {
      console.error("Error generating combination", error);
      await connection.rollback();
      throw error;
    }
  }

  /**
   * @typedef {Object} Item
   * @property {number} type_id
   * @property {string} prefix
   */

  /**
   * @typedef {Object} ItemInternal
   * @property {number} typeId
   * @property {string} prefix
   */

  /**
   * @typedef {Object} GenerationAssets
   * @property {string[][]} allItems
   * @property {ItemInternal[]} missingItems
   */

  /**
   * @param {Object} options
   * @param {number[]} options.inputArray
   * @param {Item[]} options.existingItems
   * @returns {GenerationAssets}
   */
  loadGenerateCombinationAssets(
    options,
  ){

    const {
      inputArray,
      existingItems,
    } = options;

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

    return {
      allItems,
      missingItems,
    }
  }
}

export default CombinationService;


