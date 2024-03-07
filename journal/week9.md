# Week 9 — CI/CD with CodePipeline, CodeBuild and CodeDeploy

## CI/CD
The idea is that we want to automate any of our changes.
We want to create a pipeline using CodePipeline

## CodePipeline
CodePipeline allows integration with numerous providers (e.g. Github, Gitlab) in order to build a customized CI/CD pipeline for AWS services.

The aim of this week is to build an automated pipeline that allows us to push our production changes automatically from any code changes that we make in our `prod` Github branch for the repo, to the services which are defined as to be updated.

In this first case, we will try to automate the changes to our `backend-flask` production ECS service that we have for our application.

## Stages
There are multiple stages that we can define and customize for our CodePipeline pipeline. We must include at least two stages for a pipeline to be able to be created.
### Source
The `source` stage references whatever version control provider we are using for our codebase. In this instance, we are using GitHub, so you can create a connection from this area of CodePipeline. In this case, we are creating a specific connection which authorizes CodePipeline for the `aws-bootcamp-cruddur-2023` repo.

We want to also create a `prod` branch to make sure there is that separation of concerns, as we only want this pipeline to execute based on changes made to the production application architecture/code. 

### Build
The `build` stage is where the files and the schemas are built and packaged up so that they can be referenced by the `deploy` stage. It builds out the new versions so that then the deployment will use these updated built files to deploy the updated code/architecture. 

We need to create or integrate a CodeBuild project for this stage. Something to be aware of is that we don't actualy want to select a VPC that the CodeBuild project will access, as this then also requires that you deploy the project in certain private subnets, and you would need to configure connectivity with ECR and the subnets in order for communication to occur between them (e.g. NAT Gateways and Security Groups etc.)

### Deploy
The `deploy` stage defines where we are actually wanting to deploy our resulting application changes to. In this case we are using ECS to deploy any updates to the tasks and services that we need, specifically the `backend-flask` service on our ECS cluster.


## AWS CodeBuild

### Creating a Buildspec file
We need a `buildspec.yaml` file in order to help build the project. We add it to the `./backend-flask/` directory.

## Environment Variables
Whatever we are wanting to pass as environment variables (you can check the `build` script in `bin/backend` and `bin/frontend`) can be transported over instead to the buildspec.yml




## Cost Management - ECS Production Phase
### Adjusting Desired Running Tasks
I adjusted the desired running tasks to 0 for both the frontend and backend services on the `cruddur` cluster, just temporarily as I wanted to reduce any unwanted spend while not using production. I will adjust this back up to 1 which was the previously desired state on an ad hoc basis when we are working with production, until production is ready to be deployed on a consistent basis.


## Adding Inline Policy
This was necessary to be added to the CodePipeline role in order to properly access ECR.

```json

{
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetAuthorizationToken",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },

```

## Changing Runtime Version
I also ran into issues with the `runtime-versions` key. I chose to change to `python: 3.7` rather than `docker: 20` as CodeBuild was telling me that there was no runtime called `docker`.

## Spinning Up Production

The changes that I made in the previous week's documentation regarding cost reduction for the ALB, namely limiting the ALB to AZ `us-east-1a` and `us-east-1b`, caused an issue when coming to the automated deployment. After investigating I realised that the target group for the backend was in fact creating containers that were in the wrong subnets, or at least were unreachable from the ALB, as they needed to be in `us-east-1a` or `us-east-1b`.

The quickest way to resolve this would be to update the service definition for the ECS backend-flask deployment. This can be done by simply editing the `service-backend-flask.json` in my codebase and editing the associated subnets, limiting them to just the two which correspond to `us-east-1a` and `us-east-1b`.


## Issues with Deployment
I was consistently getting some issues with the `deploy` phase of the pipeline. The tasks that were being spun up in the `backend-flask` ECS service were consistently showing as `UNHEALTHY`. I reviewed the health check information and noticed that there was a pathing issue in the `healthCheck` key of the task definition:

`python /backend-flask/bin/flask/health-check`

The correct pathing based on the directory structure should be:

`python /bin/health-check`

 even when I tried to manually configure the health check and update the ECS task definition, when I then triggered the pipeline, it would build out a new task definition which was using the wrong pathing again.

 I checked the CodeBuild logs for the build stage, and realised by spotting:

 `ENV PYTHONUNBUFFERED=1`
 
 This was only something which was included in the non-production Dockerfile. I then tried to adjust the `buildspec.yml` so that it would reference the `Dockerfile.prod` that contains the correct docker build information.