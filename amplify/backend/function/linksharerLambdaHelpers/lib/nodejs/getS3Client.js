const AWS = require('aws-sdk')

MOCK = process.env.MOCK;

let s3;
if (MOCK) {
    // setup an local endpoint
    let ep = new AWS.Endpoint('http://localhost:20005');

    // make your constructor  with these parameters
    s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        endpoint: ep.href,
        s3BucketEndpoint: true,
        sslEnabled: false,
        s3ForcePathStyle: true,
    });
} else {
    s3 = new AWS.S3();
}

module.exports = s3;
