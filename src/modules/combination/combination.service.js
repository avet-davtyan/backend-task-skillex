import CombinationStoreCreateService from "../combination-store/combination-store-create.service.js";
import ItemStoreCreateService from "../item-store/item-store-create.service.js";
import ItemStoreGetService from "../item-store/item-store-get.service.js";
import ResponseStoreCreateService from "../response-store/response-store-create.service.js";
import { getConnection } from "../../db/connection.js";

/**
 * 
 * @param {Array<string>} arr 
 * @param {number} index 
 * @param {Array<Array<string>>} combinationList
 * @param {Array<Array<string>>} itemList  
 * @param {number} combinationLength 
 */
function combine(arr, index, combinationList, itemList, combinationLength) {
  if (arr.length === combinationLength) {
    combinationList.push(arr);
    return;
  }
  for (let i = index; i < itemList.length; i++) {
    for (let j = 0; j < itemList[i].length; j++) {
      combine([...arr, itemList[i][j]], i + 1, combinationList, itemList, combinationLength);
    }
  }
}

/**
 * @param {Array<Array<string>>} itemList 
 * @param {number} combinationLength 
 * @returns {Array<Array<string>>}
 */
function generateValidCombinationList(itemList, combinationLength) {
  const combinationList = [];
  combine([], 0, combinationList, itemList, combinationLength);
  return combinationList;
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

      const existingItems =
        await this.itemStoreGetService
          .getItemsByInputArrayTypeIds(
            connection,
            inputArray,
          );

      const combinationGenerationAssets =
        this.loadCombinationGenerationAssets({
          existingItems,
          inputArray,
        });

      const {
        allItems,
        missingItems,
      } = combinationGenerationAssets;

      const combinationList = generateValidCombinationList(allItems, length);

      await connection.beginTransaction();

      await this.itemStoreCreateService.createItemManyQuery(connection, missingItems);
      const createdCombinationList =
        await this.combinationStoreCreateService
          .createCombinationQuery(
            connection,
            {combinationList},
          )
      await this.responseStoreCreateService
        .createResponseQuery(
          connection,
          {
            requestData: inputArray,
            combinationId: createdCombinationList.id,
          }
        );
      await connection.commit();  

      return {
        id: createdCombinationList.insertId,
        combination: combinationList,
      };
    } catch (error) {
      await connection.rollback();
      console.error("generateAndSaveCombination", error)
      throw new Error("Combination generation failed");
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
  loadCombinationGenerationAssets(
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
        if (
          existingItems.find(
            item => item.type_id === typeId &&
            item.prefix === prefix) === undefined
          ) {
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


