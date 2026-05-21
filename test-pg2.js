const { parse } = require('pg-connection-string');
console.log(parse("postgresql://postgres.zxwnjqtebeuxtftstnar:rAadZWMayNIabG58@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"));
