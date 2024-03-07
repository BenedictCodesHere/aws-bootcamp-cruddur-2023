# Week 11 - Fixing Application Errors In Staging

### Links To External Resources
https://yocollab.medium.com/lamba-private-vpc-endpoint-and-secrets-manager-2d35e4899a0c

https://repost.aws/knowledge-center/lambda-secret-vpc

## Static Build for Frontend

Our application architecture now looks like:
1. Backend service hosted on ECS, deployed via CI/CD Merge Request trigger on GitHub
    - direct requests to this are routed to the ALB which is served via Route 53 in the Hosted Zone as an alias on `api.cruddurclone.com`.
2. Frontend service hosted via CloudFront, static files served from an S3 bucket
    - requests routed to CloudFront distribution via the root domain `cruddurclone.com`, in the Route 53 Hosted Zone as an alias `cruddurclone.com` and `www.cruddurclone.com`.



 need to actually build out the code for the frontend. We start by adding a `./bin/frontend/static-build` for building the frontend code which we will push to the S3 frontend bucket `cruddurclone.com`.

 We need to run an `npm run build` in the script.

Once built, we need to zip and download the build directory.
We then add the directory contents to the `cruddurclone.com` S3 bucket.

Next we install a tool from rubygems called `aws_s3_website_sync` which allows syncing of a local folder from your local dev environment to the S3 bucket and then invalidates the CloudFront cache.

We create a `Gemfile` that installs the gem:

```rb

```

Then proceed to do a `bundle install`

Create a `Rakefile`:

```rb
#!/usr/bin/env ruby

require 'aws_s3_website_sync'
require 'dotenv'

env_path = "/workspace/aws-bootcamp-cruddur-2023/sync.env"
Dotenv.load(env_path)

puts "== configuration"
puts "aws_default_region:   #{ENV["AWS_DEFAULT_REGION"]}"
puts "s3_bucket:            #{ENV["SYNC_S3_BUCKET"]}"
puts "distribution_id:      #{ENV["SYNC_CLOUDFRONT_DISTRUBTION_ID"]}"
puts "build_dir:            #{ENV["SYNC_BUILD_DIR"]}"

changeset_path = ENV["SYNC_OUTPUT_CHANGESET_PATH"]
changeset_path = changeset_path.sub(".json","-#{Time.now.to_i}.json")

puts "output_changset_path: #{changeset_path}"
puts "auto_approve:         #{ENV["SYNC_AUTO_APPROVE"]}"

puts "sync =="
AwsS3WebsiteSync::Runner.run(
  aws_access_key_id:     ENV["AWS_ACCESS_KEY_ID"],
  aws_secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"],
  aws_default_region:    ENV["AWS_DEFAULT_REGION"],
  s3_bucket:             ENV["SYNC_S3_BUCKET"],
  distribution_id:       ENV["SYNC_CLOUDFRONT_DISTRUBTION_ID"],
  build_dir:             ENV["SYNC_BUILD_DIR"],
  output_changset_path:  changeset_path,
  auto_approve:          ENV["SYNC_AUTO_APPROVE"],
  silent: "ignore,no_change",
  ignore_files: [
    'stylesheets/index',
    'android-chrome-192x192.png',
    'android-chrome-256x256.png',
    'apple-touch-icon-precomposed.png',
    'apple-touch-icon.png',
    'site.webmanifest',
    'error.html',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'robots.txt',
    'safari-pinned-tab.svg'
  ]
)

```



We also need to update the CloudFormation stack for the root bucket to make sure that it is not publicly accessible. I manually blocked public access to the bucket and the site is still reachable from a browser.

The ruby gem for `aws_s3_website_sync` has a `gemspec` file which references the files to be included, so inside `lib` there is an `aws_se_website_sync.rb` file and a folder that is adjacent to this with the same name and no file extension, and inside that folder are all the files that are referenced and required e.g.

```rb

require_relative 'aws_s3_website_sync/color'
require_relative 'aws_s3_website_sync/runner'
require_relative 'aws_s3_website_sync/list'
require_relative 'aws_s3_website_sync/preview'
require_relative 'aws_s3_website_sync/plan'
require_relative 'aws_s3_website_sync/apply'

```

The point of this gem is for a Terraform-like way of deploying to the S3 bucket, with plan, preview, and apply steps.

To execute the gem with your created Rakefile, do:

```sh
bundle exec rake sync
```


## Sync Script - Executable
`./bin/frontend/sync`:

```rb
#!/usr/bin/env ruby

require 'aws_s3_website_sync'
require 'dotenv'

env_path = "/workspace/aws-bootcamp-cruddur-2023/sync.env"
Dotenv.load(env_path)

puts "== configuration"
puts "aws_default_region:   #{ENV["AWS_DEFAULT_REGION"]}"
puts "s3_bucket:            #{ENV["SYNC_S3_BUCKET"]}"
puts "distribution_id:      #{ENV["SYNC_CLOUDFRONT_DISTRUBTION_ID"]}"
puts "build_dir:            #{ENV["SYNC_BUILD_DIR"]}"

changeset_path = ENV["SYNC_OUTPUT_CHANGESET_PATH"]
changeset_path = changeset_path.sub(".json","-#{Time.now.to_i}.json")

puts "output_changset_path: #{changeset_path}"
puts "auto_approve:         #{ENV["SYNC_AUTO_APPROVE"]}"

puts "sync =="
AwsS3WebsiteSync::Runner.run(
  aws_access_key_id:     ENV["AWS_ACCESS_KEY_ID"],
  aws_secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"],
  aws_default_region:    ENV["AWS_DEFAULT_REGION"],
  s3_bucket:             ENV["SYNC_S3_BUCKET"],
  distribution_id:       ENV["SYNC_CLOUDFRONT_DISTRUBTION_ID"],
  build_dir:             ENV["SYNC_BUILD_DIR"],
  output_changset_path:  changeset_path,
  auto_approve:          ENV["SYNC_AUTO_APPROVE"],
  silent: "ignore,no_change",
  ignore_files: [
    'stylesheets/index',
    'android-chrome-192x192.png',
    'android-chrome-256x256.png',
    'apple-touch-icon-precomposed.png',
    'apple-touch-icon.png',
    'site.webmanifest',
    'error.html',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'robots.txt',
    'safari-pinned-tab.svg'
  ]
)
```

This file loads the environment variables specified in the `sync.env` file and configures them for use in the runner. The runner runs the sync process, referencing the `s3_bucket` and `distribution_id` on the AWS side, and the `build_dir` on the local side. 

The `sync.env` file is generated by the `./erb/sync.env.erb` file.

## Credential Issues due to STS and incompatibility with gem

I tried to sync changes however I was getting error messages related to `invalid aws access key id`.

I cloned the gem's repo code to my local machine, and uploaded it to a private repository to amend the code and test it.

I added the AWS_SESSION_TOKEN functionality and pushed it to my private repo.

I then referenced my private repo in the `Gemfile` of my project, creating a `:frontend` group which contains:

```rb

source "https://rubygems.org"
group :frontend do
    gem 'aws_s3_website_sync', git: 'https://github.com/benedictcodeshere/aws_s3_website_sync.git', branch: 'main'
    gem "ox"
    gem "dotenv"
  end

```

I then ran 
```sh
bundle install
```

and then I got an error relating to the `plan.rb` file of the gem, unexpected argument, `aws_session_token`. I had added the variable to the other files but not this one, so I added it in, committed the change, ran `bundle install` again, and tried to execute the `./bin/frontend/sync` script once more.

I updated the version number from `1.1.0` to `1.2.0` and ran `bundle update aws_s3_website_sync` in order to see the changes propagate in the `Gemfile.lock` and on the command line.

The script then ran as one would want however there were no changes detected between the local `build` folder and the remote bucket/distribution. I made a small change to the frontend code and ran `./bin/frontend/static-build` again to update the code, and `./bin/frontend/sync` to sync the changes to the S3 bucket and invalidate the CloudFront cache to force the users to reference the updated static files.

I ran into an issue however with `403 Access Denied` when trying to access the website through its domain name. At first I thought this might be due to the CloudFront invalidation, but this shouldn't cause issues as the requests should just go to the origin bucket at that point.

The issue seems to be due to the manual configuration change I made to bucket access after the bucket had been deployed by CloudFormation. I resolved this by creating an `Origin Access Identity` for the CloudFront distribution and updating the bucket policy to allow the distribution to perform the `s3:GetObject` action on all resources within the `cruddurclone.com` bucket.

This resolved the issue and I was able to see the minor change that I had made to the application code. I then restored it back to normal, ran build and sync again.

# To Do
- Update the CloudFormation template for the `frontend` stack to include Origin Access Control settings for the CloudFront distribution to reference the `RootBucket`. Block public access to the RootBucket.
- Create automated deployment for the changes so that the build and sync steps for the frontend occur manually.


  ## Automated Build & Sync
  We want to trigger the workflow using GitHub Actions, and we can define a `workflow` using a YAML file, which outlines a set of steps or stages for each action that runs as a job.

  In order to perform AWS related actions, the recommended method for fetching credentials from AWS is to use an IAM role that gets assumed by the workflow. 
  The information around it can be found here:
  https://github.com/aws-actions/configure-aws-credentials

  We opt to use the `OIDC provider` method, which requires us to create this provider. We can do this via a CloudFormation template which we place in `./aws/cfn/sync/template.yaml`.

  ## Federating the GitHub OIDC as an IAM IdP
  If you use GitHub's OIDC provider then you need to set up federation with the provider in as an IAM IdP. This only needs to be created once per AWS account.

  ### Steps
  1. Execute the `./bin/cfn/sync` script
    - This produces a `CrdSyncRole` IAM Role
  2. Attach policies to the role
    - Can do this inline

  ![CrdSyncRole-inline-policy](./inline_policy_for_OIDC_role.png)

  3. Reference the ARN of the `CrdSyncRole` in our `./.github/workflows/sync.yaml` file as the `role-to-assume`.

### Note: Incomplete, moving on to priority areas e.g. reconnecting database and post confirmation lambda


## Reconnecting Database and Post Confirmation Lambda

First we want to configure from our local environment the correct `PROD_CONNECTION_URL`.

Then we want to make sure the security group for the `cruddur-db-instance` is configured to let traffic from my `WORKSPACE_IP`.
We should be able to update the SG with `./bin/rds/update-sg-rule`

I ran into issues with the fact that the `update-sg-rule` script still referenced the old `DB_SG_RULE` and `DB_SG_RULE_ID`. I updated these variables and executed the script, updating the correct SG, the `CrdDbRDSSG` which was created in the CloudFormation `db` stack by the `./aws/cfn/db/template.yaml`. 

Once I had done this I was able to connect using `./bin/db/connect prod`.

### TO DO
- Manage to configure the `./bin/rds/update-sg-rule` script or the gitpod env vars to update after a successful CFN stack deployment, potentially with another script that uses AWS CLI commands to pull in the relevant updated IDs.

## Schema Load
`./bin/db/schema-load prod` to load the schema into the database.

`CONNECTION_URL=$PROD_CONNECTION_URL ./bin/db/migrate` to add the bio row to the `users` table.

### TO DO
- Currently this is a manual process still, it would be good to have this automated, either via CodeDeploy or via a custom resource Lambda that connects to the db and loads the schema and performs the migration, and it should depend on the creation of the RDS instance.

## Adding the Cognito Info to the Database
We need to clear out the test data from the cognito area first of all.


## Cruddur Post Confirmation
Update the `CONNECTION_URL` for the Lambda function to use the correct one.
Create a new Security Group, `CognitoLambdaSG`.
Edit the Inbound Rules for the `CrdDbRDSSG` to allow inbound Postgres traffic from `CognitoLambdaSG`.
Update the `Configuration/VPC` for the Lambda, edit VPC, subnets that the Lambda is deployed into, and add the `CognitoLambdaSG`.

## Adding DB Secret Config to Post Confirmation Lambda
Attach to the Lambda:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "secretsmanager:GetSecretValue",
            "Resource": "arn:aws:secretsmanager:region:account-id:secret:secret-name"
        }
    ]
}
```


Attach to the DB Secret:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::account-id:role/lambda-execution-role"
            },
            "Action": "secretsmanager:GetSecretValue",
            "Resource": "arn:aws:secretsmanager:region:account-id:secret:secret-name"
        }
    ]
}

```

I updated the Lambda code to refer to the secret. I wanted to make sure that we were referring to the database credentials in a secure way. 

 I ran into issues:
- Timeout
  - Changed this to 15 seconds
  - Temporarily added env var of the `CONNECTION_URL` and was able to write to database
  - Commented out areas of the code to focus solely on retrieving the secret and still timed out.

I worked out that it must be the configuration between Secrets Manager and the Lambda that is causing the issue. The areas to review were:
- Networking Configuration
  - I temporarily allowed all traffic between the two
  - I 

My solution became this approach:
https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html

The relevant parts being:

1. Add a Lambda layer:

```
Add the layer to your function by doing one of the following:

Open the AWS Lambda console at https://console.aws.amazon.com/lambda/.

Choose your function, choose Layers, and then choose Add a layer.

On the Add layer page, for AWS layers, choose AWS Parameters and Secrets Lambda Extension, and then choose Add.
```

```sh
aws lambda update-function-configuration \
    --function-name cruddur-post-confirmation \
    --layers arn:aws:lambda:us-east-1:177933569100:layer:AWS-Parameters-and-Secrets-Lambda-Extension:11
```

2. I have already added the permission `secretsmanager:GetSecretValue` for the specific `secret ARN` to the Lambda.

3. Add environment variables:

Add environment variable:

```
To provide the in-memory cache for parameters and secrets, the extension exposes a local HTTP endpoint, localhost port 2773, to the Lambda environment. You can configure the port by setting the environment variable PARAMETERS_SECRETS_EXTENSION_HTTP_PORT.
```

4. Configure the headers:

```py
import os
headers = {"X-Aws-Parameters-Secrets-Token": os.environ.get('AWS_SESSION_TOKEN')}
```

The session token is provided by Lambda for all running functions.

5. Add the code:

```py

secrets_extension_endpoint = "http://localhost:" + \
    secrets_extension_http_port + \
    "/secretsmanager/get?secretId=" + \
    <secret_name>
  
  r = requests.get(secrets_extension_endpoint, headers=headers)
  
  secret = json.loads(r.text)["SecretString"] # load the Secrets Manager response into a Python dictionary, access the secret

```


## Troubleshooting Lambda Timeout
After many headaches, I got to the bottom of why the Lambda function execution would time out when attempting to get the secret.

Here are the steps from this useful article: https://yocollab.medium.com/lamba-private-vpc-endpoint-and-secrets-manager-2d35e4899a0c

```

Create a VPC Endpoint for Secrets Manager a.k.a Secrets Manager interface endpoint in your lambda region (how?)
Add a Lambda Environment variable “SECRETS_MANAGER_ENDPOINT” and set it to https://secretsmanager.<your_region>.amazonaws.com
Then when you set up the boto3.client connection, set it like this:
client = boto3.client(‘secretsmanager’, endpoint_url=os.environ[‘SECRETS_MANAGER_ENDPOINT’])
Finally, ensure your Secrets Manager endpoint VPC subnet configuration matches the subnet configuration you set up for your lambda function. Otherwise, you’ll Lambda function will timeout waiting to connect to the Secrets Manager to get/write your secrets.

```


I continued to have issues, I created another lambda to test and it was able to retrieve secrets but not write to the database as one would expect. 

Finally the solution was to create a security group for the Secrets Manager VPC Endpoint that was configured to have an Inbound rule which allows the Lambda's security group HTTPS 443 traffic to it.
This then meant that I was able to pull the secret in, construct the string and use this as the `connection_url` for the database.
I tested the signup and confirmation process on the browser and it worked as expected.

This meant I was able to implement a more secure solution than previously, where the `CONNECTION_URL` was set as an environment variable directly in the Lambda.

I also updated the code to obscure some more of the data, the `SECRET_NAME` being pulled in via an environment variable.

