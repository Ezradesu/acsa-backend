const { parse } = require('pg-connection-string');
console.log(parse("base"));
console.log(parse("postgres://base"));
console.log(parse("postgresql://base:5432/db"));
console.log(parse("postgresql://user:pass@base:5432/db"));
