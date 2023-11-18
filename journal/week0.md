# Week 0 — Billing and Architecture

Architectural Diagram - to be updated as time progresses


[architectural-diagram.png]



Request-Response Flow

### User Enters URL and Presses Enter:

When the user enters 'cruddurclone.com' in their browser and presses 'enter', a DNS lookup is initiated to resolve the domain name to an IP address.

### DNS Resolution:

Route 53, which is the DNS service provided by AWS, is responsible for DNS resolution. It looks up the A record associated with 'cruddurclone.com'.

### Route 53 and A Record:

The A record points to an IP address, which in this case is the IP address of an Application Load Balancer (ALB).

### Application Load Balancer (ALB):

The ALB is responsible for routing incoming requests to different services based on various rules. It receives the incoming request.

### Target Group:

The ALB forwards the request to a target group. In this case, it directs the request to the frontend service running on Elastic Container Service (ECS) in the 'cruddur' cluster.

### ECS Cluster:

The request reaches the ECS cluster named 'cruddur', specifically targeting the 'frontend-react-js' service.

### Frontend Service:

The 'frontend-react-js' service handles the incoming request from the ALB. It may include serving static assets and managing the user interface.

### User Authentication Check:

At this point, the frontend code (JavaScript) running in the user's browser may check if the user has a JWT (JSON Web Token). If the user has a JWT, it's an indicator that they are authenticated.

### AWS Cognito Authentication:

If the user is not authenticated (no valid JWT), the frontend code can make a request to AWS Cognito, which is the authentication service. It checks the validity of the JWT and confirms if the user is authenticated.

### Customized vs. Default Homepage:

Based on the result of the AWS Cognito authentication check, the frontend code decides whether to show the customized user homepage (for authenticated users) or the default homepage (for unauthenticated users).

### Response to the User:

Finally, the frontend service generates an HTML response and sends it back to the user's browser. This response includes the appropriate homepage based on the authentication status.