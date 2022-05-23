/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_LINKSHARERBOOKMARKSIMAGES_BUCKETNAME
	STORAGE_LINKSHARERDYNAMODB_ARN
	STORAGE_LINKSHARERDYNAMODB_NAME
	STORAGE_LINKSHARERDYNAMODB_STREAMARN
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
    ENV
    REGION
    AUTH_LINKSHARER2C77AF66_USERPOOLID
    STORAGE_LINKSHARERDYNAMODB_NAME
    STORAGE_LINKSHARERDYNAMODB_ARN
    STORAGE_LINKSHARERDYNAMODB_STREAMARN
    STORAGE_LINKSHARERBOOKMARKSIMAGES_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const sharp = require('sharp');
const { uuid } = require('uuidv4');
const chromium = require('chrome-aws-lambda');
const prependHttp = require('prepend-http');
const reply = require('/opt/nodejs/reply');

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = require('/opt/nodejs/getDynamoDBClient');
const s3 = require('/opt/nodejs/getS3Client');
const tableName = require('/opt/nodejs/getDynamoDBTableName');

const REGION = process.env.REGION;
const S3_BUCKETNAME = process.env.STORAGE_LINKSHARERBOOKMARKSIMAGES_BUCKETNAME;
const S3_URL = `https://${S3_BUCKETNAME}.s3.${REGION}.amazonaws.com`;

const THUMB_WIDTH = 640;

const addBookmark = async (event, userId) => {
    const body = JSON.parse(event.body)
    const bodyUrl = body?.url;

    if (!bodyUrl) {
        return reply(500, {
            error: "Invalid input of url"
        });
    }

    const url = prependHttp(bodyUrl);

    console.log(`URL: ${url}`);

    const id = uuid();
    const fileName = `${uuid()}.png`;
    let title, image, browser;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1280, height: 768 },
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "load",
        });

        title = await page.title();
        image = await page.screenshot();
    } catch (error) {
        return reply(500, {
            error: `failed to put take screenshot of url, <${error.toString()}>`
        })
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }

    const imageFilename = `public/image/${fileName}`;
    const imageUrl = `${S3_URL}/${imageFilename}`;
    try {
        await s3.putObject({
            Bucket: S3_BUCKETNAME,
            Key: imageFilename,
            Body: image,
        }).promise();
    }
    catch (error) {
        return reply(500, {
            error: `failed to upload image to s3, (${S3_URL}) <${error.toString()}>`
        })
    }

    const imageThumbFilename = `public/image_thumb/${fileName}`;
    const imageThumbUrl = `${S3_URL}/${imageThumbFilename}`;
    let imageThumb;
    try {
        imageThumb = await sharp(image).resize(THUMB_WIDTH).toBuffer();
    } catch (error) {
        // // if thumbnail could not be created, just use used imageUrl
        // imageThumbUrl = imageUrl;
        // imageThumb = null;
        return reply(500, {
            error: `Thumbnail could not be created, <${error.toString()}>`
        })
    }

    try {
        if (imageThumb) {
            await s3.putObject({
                Bucket: S3_BUCKETNAME,
                Key: imageThumbFilename,
                Body: imageThumb,
            }).promise();
        }
    }
    catch (error) {
        return reply(500, {
            error: `failed to upload thumbnail to s3, (${S3_URL}) <${error.toString()}>`
        })
    }

    const bookmark = {
        id,
        title,
        url,
        image: imageUrl,
        imageThumb: imageThumbUrl,
        userId,
        createdDate: new Date().toISOString()
    };

    try {
        await dynamodb.put({
            TableName: tableName,
            Item: bookmark
        }).promise();

    } catch (error) {
        return reply(500, {
            error: `failed to put bookmark in dynamodb, <${error.toString()}>`
        })
    }

    return reply(200, bookmark);
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

        return await addBookmark(event, userId);

    } catch (error) {
        return reply(500, {
            error: error.toString()
        });
    }
};
