/* Amplify Params - DO NOT EDIT
    ENV
    REGION
    STORAGE_LINKSHARERBOOKMARKSIMAGES_BUCKETNAME
    STORAGE_LINKSHARERDYNAMODB_ARN
    STORAGE_LINKSHARERDYNAMODB_NAME
    STORAGE_LINKSHARERDYNAMODB_STREAMARN
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const reply = require('/opt/nodejs/reply');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = require('/opt/nodejs/getDynamoDBClient');
const s3 = require('/opt/nodejs/getS3Client');
const tableName = require('/opt/nodejs/getDynamoDBTableName');

const S3_BUCKETNAME = process.env.STORAGE_LINKSHARERBOOKMARKSIMAGES_BUCKETNAME;

const getBookmark = async (userId, id) => {
    if (!id) {
        return reply(404, {
            error: "No id found in path"
        })
    }

    // let queryParams = {
    //     TableName: tableName,
    //     KeyConditionExpression: 'id = :id',
    //     ExpressionAttributeValues: {
    //         ':id': id,
    //     },
    //     Limit: 1
    // };

    // try {
    //     const bookmarksData = await dynamodb.query(queryParams).promise();
    //     const bookmark = bookmarksData.Items[0];
    //     return reply(200, bookmark)
    // } catch (error) {
    //     return reply(404, {
    //         error: `failed to fetch bookmark with ID <${id}> <${error.toString()}>`
    //     })
    // }
    let queryParams = {
        TableName: tableName,
        Key: {
            userId,
            id
        }
    };

    try {
        const bookmarkData = await dynamodb.get(queryParams).promise();

        if (!bookmarkData) {
            return reply(404, {
                error: `failed to fetch bookmark with ID <${id}> <${error.toString()}>`
            })
        }
        return reply(200, bookmarkData.Item)
    } catch (error) {
        return reply(404, {
            error: `failed to fetch bookmark with ID <${id}> <${error.toString()}>`
        })
    }

}

const listBookmarks = async (userId) => {
    let queryParams = {
        TableName: tableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
    };

    try {
        const bookmarksData = await dynamodb.query(queryParams).promise();
        return reply(200, {
            bookmarks: bookmarksData?.Items || []
        })
    } catch (error) {
        return reply(500, {
            error: `failed to fetch bookmarks, <${error.toString()}>`
        })
    }
}

const getPath = (url) => {
    const urlObj = new URL(url);
    return urlObj.pathname;
}

const s3Delete = async (path) => {
    return await s3.deleteObject({
        Bucket: S3_BUCKETNAME,
        Key: path,
    }).promise();
}

const deleteBookmark = async (userId, id) => {
    let bookmark;
    try {
        let queryParams = {
            TableName: tableName,
            ReturnValues: "ALL_OLD",
            Key: {
                userId,
                id
            },
        };

        const bookmarkQuery = await dynamodb.delete(queryParams).promise();
        bookmark = bookmarkQuery.Attributes;
    } catch (error) {
        return reply(401, {
            error: `The bookmark <${id}> does not belong to you <userId: ${userId}> <bookmarkuserId: ${bookmark?.userId}>`,
            bookmarkQuery
        })
    }

    if (!bookmark) {
        return reply(500, {
            error: `Could not find bookmark <${id}> to delete`
        })
    }

    const {
        image,
        imageThumb,
    } = bookmark;

    let imagePathError = "";

    try {
        const imagePath = getPath(image);
        await s3Delete(imagePath);
    } catch (error) {
        imagePathError = error.toString();
    }
    let imageThumbPathError = "";

    try {
        const imageThumbPath = getPath(imageThumb);
        await s3Delete(imageThumbPath);
    } catch (error) {
        imageThumbPathError = error.toString();
    }

    return reply(200, {
        message: `successfully deleted bookmark <${id}>, imagePatherr:<${imagePathError}>, thumberr:<${imageThumbPathError}>`
    })
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
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

        const id = event?.pathParameters?.proxy;

        switch (httpMethod) {
            case "DELETE":
                if (id) {
                    return await deleteBookmark(userId, id);
                } else {
                    throw new Error(`no ID was found to delete`);
                }
            case "GET":
                if (id) {
                    return await getBookmark(userId, id);
                }
                return await listBookmarks(userId);
            default:
                throw new Error(`Unsupported API HTTP method <${httpMethod}>`);
        }

    } catch (error) {
        return reply(500, {
            error: error.toString()
        });
    }
};
