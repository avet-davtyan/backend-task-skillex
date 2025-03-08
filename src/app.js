import express from 'express';
import dotenv from 'dotenv';
import {
  initializeTables,
} from "./db/db-initialization.js";
import ItemStoreCreateService from "./modules/item-store/item-store-create.service.js";
import { getConnection } from './db/connection.js';
import ItemStoreGetService from './modules/item-store/item-store-get.service.js';
import CombinationService from './modules/combination/combination.service.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express API!' });
});


app.post('/generate-item', async (req, res) => {
  const { typeId, prefix } = req.body;
  const connection = await getConnection();
  try {

    const itemStoreCreateService = ItemStoreCreateService.getInstance();

    await connection.beginTransaction();    
    const item = await itemStoreCreateService.createItemQuery(connection, {typeId, prefix});
    await connection.commit();
    
    res.json(item);
  } catch (error) {
    console.error("Error generating item", error);
    res.status(500).json({ error: 'Failed to generate item' });
  }
})

app.get('/items/:id', async (req, res) => {
  const { id } = req.params; // Extracting the ID from the URL
  const connection = await getConnection();

  try {
    const itemStoreGetService = ItemStoreGetService.getInstance();
    await connection.beginTransaction();
    const item = await itemStoreGetService.getItemQueryById(connection, id);
    await connection.commit();

    res.json(item);
  } catch (error) {
    console.error("Error fetching item", error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.get('/get-items/', async (req, res) => {
  const { typeId, prefix } = req.query;
  const connection = await getConnection();

  try {
    const itemStoreGetService = ItemStoreGetService.getInstance();
    await connection.beginTransaction();
    const item = await itemStoreGetService.getItemByPrefixAndTypeId(connection, {prefix, typeId});
    await connection.commit();

    res.json(item);
  } catch (error) {
    console.error("Error fetching item", error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});


app.post('/generate-v2', async (req, res) => {
  const{
    inputArray,
    length,
  } = req.body;

  const connection = await getConnection();

  try {
    const itemStoreGetService = ItemStoreGetService.getInstance();
    const itemStoreCreateService = ItemStoreCreateService.getInstance();

    await connection.beginTransaction();
    const existingItems = await itemStoreGetService.getItemsByInputArrayTypeIds(connection, inputArray);

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
      await itemStoreCreateService.createItemManyQuery(connection, missingItems);
    }
    await connection.commit();

    const combination = [];
    function combine(arr, index, res) {
      if (arr.length === length) {
        res.push(arr);
        return;
      }
  
      for (let i = index; i < allItems.length; i++) {
        for (let j = 0; j < allItems[i].length; j++) {
          combine([...arr, allItems[i][j]], i + 1, res);
        }
      }
    }
  
    combine([], 0, combination);

    res.json(combination);
  } catch (error) {
    console.error("Error fetching item", error);
    res.status(500).json({ error: 'Failed to fetch item' });
  } 
});







app.post("/generate", async (req, res) => {
  const combinationService = CombinationService.getInstance();
  const combination = await combinationService.generateAndSaveCombination(req.body);

  res.json(combination);
})

const startServer = async () => {
  try {
    await initializeTables();

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
