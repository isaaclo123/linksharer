/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_LINKSHARERDYNAMODB_ARN
    STORAGE_LINKSHARERDYNAMODB_NAME
    STORAGE_LINKSHARERDYNAMODB_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const reply = require('/opt/nodejs/reply');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = require('/opt/nodejs/getDynamoDBClient');
const tableName = require('/opt/nodejs/getDynamoDBTableName');

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const search = async (userId, query) => {
    let queryParams = {
        TableName: tableName,
        FilterExpression: 'userId = :userId and ( contains(#url, :query) or contains(title, :query) )',
        ExpressionAttributeNames: {
            '#url': 'url',
        },
        ExpressionAttributeValues: {
            ':userId': userId,
            ':query': query
        },
        ConsistentRead: false,
        Select: "SPECIFIC_ATTRIBUTES",
        ProjectionExpression: "#url, title, id"
    };

    try {
        const data = await dynamodb.scan(queryParams).promise();
        return reply(200, {
            results: data.Items || []
        });
    } catch (error) {
        return reply(404, {
            error: `failed to search <${error.toString()}>`
        })
    }
}

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    try {
        const userId = event?.requestContext?.identity?.cognitoIdentityId;

        if (!userId) {
            return reply(401, {
                error: "Not Unauthorized"
            });
        }

        const httpMethod = event?.requestContext?.httpMethod;
        const searchQuery = event?.queryStringParameters?.search

        switch (httpMethod) {
            case "GET":
                if (searchQuery) {
                    return await search(userId, searchQuery);
                }
            default:
                throw new Error(`Unsupported API HTTP method <${httpMethod}>`);
        }

    } catch (error) {
        return reply(500, {
            error: error.toString()
        });
    }
};
