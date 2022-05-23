import { AmplifyS3ResourceTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyS3ResourceTemplate) {
 resources.addCfnResource({
	"type" : "AWS::S3::BucketPolicy",
	"properties" : {
		"Bucket" : {"Ref" : "S3Bucket"},
		"PolicyDocument": {
			"Statement":[{
				"Sid": "PublidReadGetObject",
				"Effect": "Allow",
				"Action": "s3:GetObject",
				"Principal": "*",
				"Resource": { "Fn::Join" : ["", ["arn:aws:s3:::", { "Ref" : "S3Bucket" } , "/public/*" ]]}
			}]
		}
	}
}, "S3BucketPolicy");
}
