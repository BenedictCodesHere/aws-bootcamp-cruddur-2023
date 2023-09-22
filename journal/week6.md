# Week 6 — Deploying Containers


Understanding the workflow:
The docker-compose file is where multiple Docker containers are built, either by defining in the file itself, or by referencing other files, e.g. the Dockerfile or Dockerfile.prod files in the backend-flask and frontend-react-js folders, alongside environment variables. 

This week, the environment variables are being moved from being defined in the docker-compose.yml file itself, which has until now relied on environment variables set in either the Gitpod environment, or in the shell environment of the terminal, and passing those values in to the environment keys in the docker-compose.

Now we are building the environment variables with Ruby templates, creating backend-flask.env and frontend-react-js.env files, which are never pushed in the code, 

in the gitignore:
'''
*.env 
'''

The aim has been to get the relevant Docker containers that work locally to be hosted on Amazon Elastic Container Service (ECS).

The first step has been to create repositories in the Elastic Container Registry. These repositories allow images to be stored in separate, specific repositories, so rather than building via pulling docker images, we can configure and maintain specific images ourselves.

The workflow for ECR:
1. Build the relevant docker image
2. Tag and push the image to the Elastic Container Registry
    - Login to docker
    - tag the docker image
    - push to the relevant ECR


ECS requires a basic understanding of four key components, which nest from top to bottom: 

Clusters,
  services,
    tasks, 
      containers.

Clusters represent a pool of resources where you can run your containerized applications. Currently, it is the production environment for the Cruddur app that we have built a single cluster for.

The services within the cluster that we built this week are split into two:
1. backend-flask service
2. frontend-react-js service

These services are fairly self-explanatory, containing the backend and frontend configurations and containers for our app.

Tasks within these services are defined, such as xray in the backend, alongside the actual backend-flask image that we build from the ECR stored image for the backend-flask.


The container workflow to deploy the correct containers to ECS has been as follows:
1. Create a cluster
 - A cluster allows you to build multiple containers, tasks, and services.
2. Define tasks and services via task definitions and service definitions
    3. Define tasks
        - This requires creating a task definition either via the AWS CLI or the AWS UI.
        - Configuring the correct AWS roles and permissions is also crucial.
    4. Define services
        - Create service definitions either via AWS CLI or AWS UI.
5. Deploy services
    - We have been doing this via AWS CLI, using the create-service command, along with a service definition file, which configures the service in json format.

    

