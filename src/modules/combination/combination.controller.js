import CombinationService from "./combination.service.js";

/**
 * @typedef {Object} GenerateCombinationRequestBody
 * @property {number[]} inputArray
 * @property {number} length
 */

/**
 * @param {Object} req
 * @param {GenerateCombinationRequestBody} req.body
 * @param {Object} res
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function generateCombination(req, res) {
  try {
    validateRequestBodyForCombinationGeneration(req.body);

    const combinationService = CombinationService.getInstance();
    const combination = await combinationService.generateAndSaveCombination(req.body);
    res.json(combination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * @param {GenerateCombinationRequestBody} requestBody
 */
function validateRequestBodyForCombinationGeneration(requestBody) {
  if (!requestBody || !requestBody.inputArray || !requestBody.length) {
    throw new Error('Invalid request body');
  }

  const {
    inputArray,
    length,
  } = requestBody;

  if( length > inputArray.length) {
    throw new Error('Length cannot be greater than the length of the input array');
  }

  if(inputArray.length > 26){
    throw new Error('Input array length cannot be greater than 26');
  }
}

export default {
  generateCombination
};