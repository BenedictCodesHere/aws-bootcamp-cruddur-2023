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

    
We must also create a network for Docker in the docker-compose, we call this network 'cruddur-net', this makes sure that the containers can talk to each other in the way we want in our development environment.

The environment variables are defined in the gitpod.yml to be generated out at the start of each gitpod workspace deployment, so that there are updated backend and frontend .env files there each gitpod session, which can then  can then be referenced in the docker-compose.yml for the frontend and backend.


To run a container locally:
### 1. Check if images exist

'''bash
docker images
'''
which should return
'''bash
REPOSITORY   TAG       IMAGE ID   CREATED   SIZE
'''

### 2. Build the docker image
The example below is for the backend-flask image.
    '''bash
    ABS_PATH=$(readlink -f "$0")
    BACKEND_PATH=$(dirname $ABS_PATH)
    BIN_PATH=$(dirname $BACKEND_PATH)
    PROJECT_PATH=$(dirname $BIN_PATH)
    BACKEND_FLASK_PATH="$PROJECT_PATH/backend-flask"

    docker build \
    -f "$BACKEND_FLASK_PATH/Dockerfile.prod" \
    -t backend-flask-prod \
    "$BACKEND_FLASK_PATH/."
    '''
The 'docker build' command is creating an image for the backend, which builds from the Dockerfile.prod file located in backend-flask using the file referencing flag '-f', and tags the image'backend-flask-prod' using the '-t' flag.

### 3. Run the docker image
The example below is for the backend-flask image.
    '''bash
    ABS_PATH=$(readlink -f "$0")
    BACKEND_PATH=$(dirname $ABS_PATH)
    BIN_PATH=$(dirname $BACKEND_PATH)
    PROJECT_PATH=$(dirname $BIN_PATH)
    ENVFILE_PATH="$PROJECT_PATH/backend-flask.env"

    docker run --rm \
    --env-file $ENVFILE_PATH \
    --network cruddur-net \
    --publish 4567:4567 \
    -it backend-flask-prod
    '''
    
Here environment variables are populated from the backend-flask.env file that we generated on Gitpod startup via the Embedded Ruby ERB template. It specifies the network 'cruddur-net' on which the container should run, and publishes the port 4567, making it interactive and adding terminal functionality with '-it' flag, and specifying the image to run, 'backend-flask-prod'.

The Dockerfile.prod pulls from AWS ECR image, the python slim-buster in your repo. So you need to be authenticated in order to be able to pull that image to build from.
