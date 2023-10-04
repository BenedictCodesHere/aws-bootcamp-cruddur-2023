# Week 8 — Serverless Image Processing

Adding CDK in the folder ./thumbing-serverless-cdk

import s3 object from aws-cdk-lib

define bucket(scope, id, props)

cdk synth

cdk bootstrap - bootstraps for account, region


ERRORS - bucket name incorrect

The original bucket was being published under "cruddur-thumbs" in the example. After changing bucket name and redeploying, the bucket name remained "cruddur-thumbs". The stack itself had to be torn down in order to rename the bucket.

Then it was discovered that it was environment variables (used grep to check) that were causing this issue.

Environment variable chain/hierarchy is always important to understand and check.

On CDK Deploy:

The lambda function and the bucket are created, and alongside them, IAM service roles are created.



## CLOUDFRONT

- ACM for CloudFront must be hosted in us-east-1

- Set up Route 53 - alias to assets.cruddurclone.com

- Adding the bucket policy from CloudFront to attach to the S3 bucket


## Architecture - S3
- Separating the bucket into assets bucket and processed bucket
    - Advantage of being able to lock down the originals bucket and separate so only processed is publicly served
