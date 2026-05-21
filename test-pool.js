const { Pool } = require('pg');
const pool = new Pool({ connectionString: undefined });
console.log(pool.options.host);
