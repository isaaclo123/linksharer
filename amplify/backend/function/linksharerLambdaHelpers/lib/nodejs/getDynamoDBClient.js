const AWS = require('aws-sdk')

MOCK = process.env.MOCK;

const clientConfig = MOCK ? {
    region: 'us-fake-1',
    endpoint: 'http://localhost:20005',
} : undefined;
const dynamodb = new AWS.DynamoDB.DocumentClient(clientConfig);

module.exports = dynamodb;
