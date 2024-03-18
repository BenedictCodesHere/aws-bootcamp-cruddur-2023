# Week 12 - Security and Cost Fixes

## Cleaning the Environment
After testing that the application is working, I performed a security audit on my application.

### Removing/Altering Sensitive Data
I want to make sure that the least amount of sensitive data is included in the codebase of the application.


Move environment variables offline
load in the dev variables from an s3 bucket
load in the production variables from parameter store or secrets manager

### Review Permissions Policies


## Cost

### Reducing the number of endpoints for secrets manager; checking if the endpoints are even necessary


## General Config

### Configuring XRay

### Configuring the machine user permissions
The machine user we configured essentially is what we have made as the task role for the backend-flask task. We want the backend to be able to have the permissions necessary to perform the actions needed, and no more than this.

We want to make sure that the most granular, least privilege permissions possible are granted to the task in order for it to perform its role. 

We have xray as a sidecar container.



### UI Cleanup
- Fixing the styling of the page so the `section` sidebar on the right-hand side  

## Data Propagation - Display Name
the `display_name` property that we are updating in our User Profile page is not propagating through to the sidebar. This shows that there is some stale data that we are retrieving or that we are not fully updating. The local database shows the correct `display_name` following the update on the `ProfileForm` and refresh of the page, however the sidebar still shows the outdated data. The same is in fact true on the `UserFeedPage` where the `user` component contains the outdated `display_name`, but `profile` I am assuming shows the correct `display_name`.

## IMPORTANT - Prod and Dev writes to the respective databases




## Production Testing

### CORS
Upated CORS policy for API Gateway to be configured correctly for Production origin.

### Update Profile - HTTP Methods
Made sure that the `PUT` request being made to update the User Profile (display name and bio) is allowed in the CORS configuration for Flask.


## Sync Script - Issues with CloudFront Invalidation
For some reason, both times when I have tried to update the rootbucket files with the updated build of the frontend, I then get `Access Denied` and so far have been unable to figure out why, despite troubleshooting. I have had to delete and redeploy the CloudFormation stacks, and then on the fresh upload of the new build to the rootbucket, it works fine.



## Next Steps Following Deployment
###
Attempting to fix the data propagation issues for the profile, as it seems the user


### Separating Concerns Further between Dev and Prod Environments
Creating a separate Cognito user pool would make the most sense, as this would allow a fully separate architecture, whereas currently the data that is in the dev application related to users and activities, relies on the same user pool as production. This means that the management of side effects from changes to user and profile related information has to be managed very carefully in the current architecture. It would be much better practice to have separate user pools.