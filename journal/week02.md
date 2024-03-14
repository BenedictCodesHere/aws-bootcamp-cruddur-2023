# Week 2 - Distributed Tracing

## Aim
The aim for this week is to implement within our codebase, primarily in the backend of our app, some observability logs, traces, and metrics.
With these, we will implement distributed tracing within our application, which tells the story of what is happening within the application, 
rather than disparate line after line of random, incoherent logs. This makes our life much easier when tackling issues within the app.

Observability is essentially creating a story of what events and issues are occurring within the application.
The three pillars of observability are:
    - Metrics
        - These are aggregatable and low-volume
    - Tracing
        - These are request-scoped and medium-volume
    - Logging
        - These are triggered by events and are high-volume

Observability is crucial for understanding more about your application throughout the Software Development Life Cycle (SDLC). It can discern the 
health of a system or application, gather metrics and logs which provide datapoints on any errors that occur in the app, including where, what and when
they occur. It can identify hotspots and bottlenecks in terms of resource usage and frequent read/writes.

It is a good practice to get familiar as early as possible in the architecting of the application, with considering where to add the logging and tracing
within the app, and build it into the mix early in the SDLC.

## Tech Stack
The technology being used in this week is:
Languages:
    - Python
Frameworks:
    - Flask
Software:
    AWS/Amazon:
        - X-Ray
        - Cloudwatch
    Non-AWS:
        - Gitpod
        - Honeycomb
        - Rollbar

## Cloudwatch Logs


## Honeycomb
Used for tracing. You can create traces with spans and sub-spans. 
In this project, Honeycomb is used in conjunction with Open Telemetry (OTEL),
a vendor-neutral open-source Observability framework for instrumenting, generating, 
collecting, and exporting telemetry data.

You have to create an account on Honeycomb, and create a project. In this instance this would be 'cruddurclone.com'
and you can set different environments e.g. production, 
development, staging, testing, and you have different API keys set for each environment.

## Rollbar
Rollbar for error logging and handling.

Problem encountered with Rollbar, security issue, Rollbar database was hacked. I stripped Rollbar from the project and waited for more updates on the situation. Their advice was to rotate keys. I shut my account with them and decided if I wanted to implement Rollbar again in the project, I would set up with a different Rollbar account.

## XRay
Using xray in the python SDK, boto3 library

