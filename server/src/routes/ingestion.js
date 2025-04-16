const express = require('express');
const router = express.Router();
const clickhouse = require('../services/clickhouse');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const upload = require('../middleware/multerConfig');
const { parse } = require('fast-csv');
const { Parser } = require('json2csv');

// List all ClickHouse tables
router.get('/clickhouse/tables', async (req, res, next) => {
  try {
    const query = `SHOW TABLES`;
    const resultSet = await clickhouse.query({ query, format: 'JSON' });
    const data = await resultSet.json();
    const tables = data.data.map(row => row.name || Object.values(row)[0]);
    res.json({ tables });
  } catch (err) {
    next(err);
  }
});

// Fetch column names for a specific ClickHouse table
router.get('/clickhouse/columns/:table', async (req, res, next) => {
  const { table } = req.params;

  try {
    const query = `DESCRIBE TABLE ${table}`;
    const resultSet = await clickhouse.query({ query, format: 'JSON' });
    const data = await resultSet.json();
    const columns = data.data.map(row => ({
      name: row.name,
      type: row.type
    }));
    res.json({ columns });
  } catch (err) {
    next(err);
  }
});

// Upload CSV and return column headers
router.post('/flatfile/upload', upload.single('file'), async (req, res, next) => {
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  const headers = [];

  const stream = fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on('headers', (parsedHeaders) => {
      headers.push(...parsedHeaders);
      res.json({ columns: headers });
    })
    .on('end', () => {
      res.json({ columns: headers });
    })
    .on('error', (err) => {
      next(err);
    });
});

// Ingest Flat File (CSV) → ClickHouse Table
router.post('/flatfile/ingest', async (req, res, next) => {
  const { tableName, columns, filePath } = req.body;

  if (!tableName || !columns || !filePath) {
    return res.status(400).json({
      error: 'tableName, columns, and filePath are required in body',
    });
  }

  const fileStream = fs.createReadStream(filePath);
  const parsedRows = [];
  let inferredTypes = [];

  try {
    await new Promise((resolve, reject) => {
      fileStream
        .pipe(parse({ headers: true }))
        .on('data', (row) => {
          const sample = {};
          for (const col of columns) {
            sample[col] = row[col];
          }

          inferredTypes = columns.map((col) => {
            const value = sample[col];
            if (!isNaN(value) && Number.isInteger(+value)) return 'Int64';
            if (!isNaN(value) && !Number.isNaN(parseFloat(value))) return 'Float64';
            if (value?.toLowerCase?.() === 'true' || value?.toLowerCase?.() === 'false') return 'Bool';
            return 'String';
          });

          parsedRows.push(sample);
          resolve();
        })
        .on('error', reject);
    });

    const columnDefs = columns.map((col, i) => `\`${col}\` ${inferredTypes[i]}`).join(', ');
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs}) ENGINE = MergeTree() ORDER BY tuple()`;

    await clickhouse.command({ query: createQuery });

    let insertedCount = 0;
    const batchSize = 1000;
    let currentBatch = [...parsedRows];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('data', async (row) => {
          const filtered = {};
          for (const col of columns) {
            filtered[col] = row[col];
          }

          currentBatch.push(filtered);

          if (currentBatch.length >= batchSize) {
            await clickhouse.insert({
              table: tableName,
              values: currentBatch,
              format: 'JSONEachRow',
            });
            insertedCount += currentBatch.length;
            currentBatch = [];
          }
        })
        .on('end', async () => {
          if (currentBatch.length) {
            await clickhouse.insert({
              table: tableName,
              values: currentBatch,
              format: 'JSONEachRow',
            });
            insertedCount += currentBatch.length;
          }
          res.json({ message: 'Ingestion complete', insertedCount });
          resolve();
        })
        .on('error', reject);
    });
  } catch (err) {
    next(err);
  }
});

// Export ClickHouse Data → Flat File (CSV)
router.post('/clickhouse/export', async (req, res, next) => {
  const { tableName, columns } = req.body;

  if (!tableName || !columns || columns.length === 0) {
    return res.status(400).json({
      error: 'Both tableName and columns are required. Columns cannot be empty.',
    });
  }

  console.log("Exporting data from table:", tableName);
  console.log("Selected columns:", columns);

  try {
    const columnList = columns.map(col => `\`${col}\``).join(', ');
    const query = `SELECT ${columnList} FROM ${tableName}`;

    const resultSet = await clickhouse.query({
      query,
      format: 'JSON',
    });

    const jsonData = await resultSet.json();
    const result = jsonData.data;

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified columns' });
    }

    const parser = new Parser();
    const csv = parser.parse(result);

    const downloadsDir = path.join(__dirname, '../..', 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const filePath = path.join(downloadsDir, `${tableName}_export.csv`);
    fs.writeFileSync(filePath, csv);

    res.download(filePath, `${tableName}_export.csv`, (err) => {
      if (err) {
        return next(err);
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
