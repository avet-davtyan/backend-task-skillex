import express from 'express';
import dotenv from 'dotenv';
import {
  initializeTables,
} from "./db/db-initialization.js";
import ItemStoreCreateService from "./modules/item-store/item-store-create.service.js";
import { getConnection } from './db/connection.js';
import ItemStoreGetService from './modules/item-store/item-store-get.service.js';

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
  } finally {
    connection.end();
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
  } finally {
    connection.end();
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
  } finally {
    connection.end();
  }
});


app.post('/generate', async (req, res) => {
  const{
    inputArray,
  } = req.body;

  const connection = await getConnection();

  try {
    const itemStoreGetService = ItemStoreGetService.getInstance();
    await connection.beginTransaction();
    const items = await itemStoreGetService.getItemsByInputArrayTypeIds(connection, inputArray);
    await connection.commit();

    res.json(items);
  } catch (error) {
    console.error("Error fetching item", error);
    res.status(500).json({ error: 'Failed to fetch item' });
  } finally {
    connection.end();
  }
});

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
