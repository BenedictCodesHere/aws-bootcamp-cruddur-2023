# Week 10 — CloudFormation Part 1

## Creating a Changeset
Changesets are really powerful when it comes to the `Update requires` area of the code. 

## S3 Bucket for CFN Artifacts
We create an S3 bucket to store all our CloudFormation artifacts in, `cruddurclone-cfn-artifacts`.

## Creating the Base Networking Layer for Application
Creating the VPC, I chose a `10.16.0.0/16` address range to not overlap with current VPCs.


# 
It is best practice to put db in private subnets, but for debugging we want access to it.


## Deleting the Infrastructure
I delete the infrastructure that we are going to replace with the CloudFormation templated resources to avoid any naming clashes.

### ECS - Services
We delete the services for `backend-flask` and `frontend-react-js`.

### ALB
We delete the listeners for the `cruddur-alb` first, the `https:443` and `http:80` listeners.

![listeners-http](./deleted_infrastructure/cruddur-alb-http-80-listener.png)
![listeners-https](./deleted_infrastructure/cruddur-alb-https-443-listener.png)

...Then the target groups, `frontend-react-js` and `cruddur-backend-flask-tg`

![target-groups-backend](./deleted_infrastructure/cruddur-alb-tg-cruddur-backend-flask-tg.png)
![target-groups-frontend](./deleted_infrastructure/cruddur-alb-tg-cruddur-frontend-react-js.png)

...Then the ALB `cruddur-alb`

![ALB](./deleted_infrastructure/cruddur-alb.png)

I screenshotted these to make sure that I had some to hand information on them.

### ECS - Cluster
We then delete the `cruddur` cluster in ECS.

### CloudMap - Namespaces
We finally delete the `cruddur` namespace in CloudMap.



## CloudFormation Stacks

### Networking
### Cluster
### Db
### Service


## Configuring DB
`CrdSrvBackendFlaskAlbSG` needs to have the port configured of 4567, not 80.

### Considerations - Security




### Route 53
Update the records in the hosted zone for `cruddurclone.com`
`A` record for `api` - route to ALB DNS
`A` record for the naked domain - route to ALB DNS

I added some cloudformation configuration to this to update the code.

## Execute Order
1. Networking
2. Cluster
3. Db
4. Service
5. DDB

Remember the potential errors, the connection string will only be able to connect properly to the database once it is seeded with the data from inside the application. Also determine whether you want rollbar as an env var. For now though perhaps just test if it works when you pass in the MasterUsername and MasterUserPassword dynamically.


## Service Stack Issues
We want ECS Service Connect activated. We need a Cloud Map namespace for this.
The naming convention for naming a Cloud Map namespace is to match the ECS cluster name.

We have to set up the namespace before we deploy the service stack, as I was getting errors that there was no namespace with the name `CrdClusterFargateCluster`. I don't believe that you can create the namespace from CloudFormation.


I updated the naming of most things to `cruddurclone`, I also created a log group as I was running into an issue where the log group `cruddurclone` was not created and was being referenced in the task definition. Debugging this using CloudTrail was incredibly useful for checking why the service was repeatedly attempting deployment and hanging.

The `backend-flask` service on the `CrdClusterFargateCluster` cluster is now healthy.


## DynamoDB Stack



## Update Env Vars for cruddur-post-confirmation lambda
- Using outdated Connection String


## AWS SAM
3 stages:
1. Build
2. Package
3. Deploy

need a `template.yaml` and some scripts for `build`, `package`, `deploy`.



Delete the ddb stack.

Figure out if you want to rename the table `cruddurclone-messages`
Check if the lambda uses a policy that needs the precise table name

## Frontend Stack
- Made sure to add period at the end for the `RootBucketDomain` HostedZoneName.

Remove the root domain the A record for the pre-existing one.

The stack passes successfully, and now this distribution is where the domain's requests (except the `api.` subdomain, which is routing to the ALB for the backend) are being routed. 