# Week 7 — Solving CORS with a Load Balancer and Custom Domain

This week was primarily amalgamated into other weeks, however I will explain here the architecture that I began with, and the architecture that it matured into.


## Initial Architecture

The initial architecture consisted of:

1. Route 53 resolving Alias record `cruddurclone.com` and `api.cruddurclone.com` to:

2. Application Load Balancer, `default` forwarding requests to:
  - Frontend Target Group (the `frontend-react-js` ECS service)
and forwarding `api.cruddurclone.com` requests to:
  - Backend Target Group (the `backend-flask` ECS service)

3. Elastic Container Service Cluster, containing:
  - `frontend-react-js` Service, containing:
    - `frontend-react-js` Task, containing:
      - `frontend-react-js` container
  - `backend-flask` Service, containing:
    - `backend-flask` Task, containing:
      - `backend-flask` container, `XRay` container

This architecture served a purpose, however around the time of tearing down the resources and creating CloudFormation stacks launched in a fresh VPC...

The architecture was altered to:

1. Route 53 resolving Alias record `cruddurclone.com` and `www.cruddurclone.com` to:

  2. `cruddurclone` CloudFront distribution, origin pointing to:
  
  3. `RootBucket`, S3 bucket for hosting static websites

and Route 53 resolving Alias record `api.cruddurclone.com` to:

4. Application Load Balancer, `default` forwarding requests to:
  - Backend Target Group (the `backend-flask` ECS service)

5. Elastic Container Service cluster, containing: 
  - `backend-flask` Service, containing:
    - `backend-flask` Task, containing:
      - `backend-flask` container
      - `XRay` container

## Reasons for Updating the Architecture

The main reason behind the shift from a containerized frontend service to a statically hosted service is that there isn't much of a need to have compute running in a container and racking up charges when static website hosting and `CloudFront` is comparatively cheaper, and primarily designed for a frontend architecture, to handle user requests and assets caching at the edge via `CloudFront`, and hosting of `build` folder contents in an `S3 bucket`. We can make savings on cost, keep the backend of the application scalable, and because `Cognito` is taking care of user authentication requests, everything we need in the frontend can be served via this architecture and the relevant calls to `Cognito` and to the `api.cruddurclone.com` endpoints. 
