/** Database setup for BizTime. */

const { Client } = require('pg');

let DB_URI;

if (process.env.NODE_ENV === 'test') {
    DB_URI = "postgresql:///biztime_test";
} else {
    DB_URI = "postgresql:///biztime"
}

let client = new Client({
    connectionString: DB_URI
});

client.connect();

module.exports = client;