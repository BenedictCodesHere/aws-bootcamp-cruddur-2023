# Week 1 — App Containerization

## Aim

The aim for this week is to be able to containerize the pre-built frontend and backend code. We are using Gitpod as the development environment, and Docker for the containerization of the application. The focus is on getting the Dockerfiles configured correctly and also the Docker-compose file configured for the application.

The production environment will be hosted on Amazon Elastic Container Registry (Amazon ECR) as this allows for high levels of configurability (using task and service definitions), scalability (using Auto-scaling groups and load balancers), security (using security groups, firewalls, NACLs, Cloudwatch logs, monitoring tools) and connectivity with other AWS architecture elements (e.g. Lambda). We can write task and service definitions which allow us to be able to configure the containers with precision.


## Tech Stack
Development:
- Gitpod
- VSCode in Gitpod

Containerization:
- Docker

Languages:
- Text (for Dockerfiles)
-YAML for (docker-compose.yml file)

NB: The application is built on the frontend with HTML, CSS, JavaScript, React,
and the backend with Flask and Python. But we aren't really coding using these languages
this week.

## Docker in VSCode
- The Docker extension is useful to install for easy visualization and configuration via click-ops of Docker.

## Dockerfiles
- The Dockerfiles (they don't have file extensions) contain configuration rules
- Typically the first line of the Dockerfile will be pulling and building a Docker image from which to build the Docker container.
- Separate Dockerfiles can and should be specified for (development || production) environments.
- Separate Dockerfiles can and should be specified for the frontend and backend.

At first, during this week, we build for development, using a Linux base image at the start of our ./backend-flask/Dockerfile:
```
FROM python:3.10-slim-buster
```

However, further into the SDLC, when coding for production, we build from a specified image that we have pushed to Amazon Elastic Container Registry:
```
FROM $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cruddur-python:3.10-slim-buster
```

### Specifying the Work Directory
The command WORKDIR enables you to set the root directory in the container for processes/commands.
```
WORKDIR ./backend-flask
```

### Copying files

The command COPY works as you would expect, enabling you to copy from outside the container to inside the container.

```
COPY requirements.txt requirements.txt
```

## Docker Tagging

The line:

```
docker build -t backend-flask ./backend-flask
```

tags the image that is built from the referenced dockerfile as "latest". 

The "latest" tag is considered by some to be an anti-pattern or slight misnomer, 
as it is simply the default tag if no tag is specified for the image. There is no 
guarantee that the image is the chronologically latest version.

## Security
Maintaining secure containers is of critical importance. Minimizing the attack surfaces,
using the Principle of Least Privilege, ensuring that network configurations are correctly
locked down using the right routing, security groups, and also using the most streamlined images
that are up to date and don't contain packages such as curl, lock down shell access etc is crucial.

In terms of vulnerability scanning, I am using Snyk, an open-source tool which regularly scans my Github
codebase and checks against things like the CVE Program (Common Vulnerabilities and Exposures) to check for
any listings on the registry of categorised threats and exposures, triaged into tiers of severity: None, Low,
Medium, High, and Critical.

Snyk flags any vulnerabilities and makes suggestions in the form of pull requests to the repository, e.g. updating
the package version via NPM for specific packages in the 'package.json' for the project.






