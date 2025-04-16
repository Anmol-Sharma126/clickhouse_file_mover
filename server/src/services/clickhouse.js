const { createClient } = require('@clickhouse/client');
require('dotenv').config();

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_URL,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
});

module.exports = clickhouse;
