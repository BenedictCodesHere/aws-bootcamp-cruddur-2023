# Week 5 - NoSQL and Caching
## Aim
The aim this week was implementing the direct messaging service between users.
The tech stack used is:
Amazon DynamoDB
Bash Scripts
Python
JavaScript

## DynamoDB for messaging
Amazon DynamoDB is a NoSQL database service managed by Amazon. It allows plenty of customization, and we implement the code via an SDK (boto3) in the backend of our codebase.
The data is organized and stored in TABLES, which must contain a defined PRIMARY KEY, and those tables contain ITEMS, each item being composed of one or more ATTRIBUTES.

The PRIMARY KEY has two variants:
- PARTITION KEY
    - no two items can have the same partition key value
- PARTITION KEY and SORT KEY
    - Composite primary key
    - Items in table sorted by sort key value
    - Items in table must have either different partition key or different sort key

## DynamoDB - Messaging Model Diagram

![DynamoDB Messaging Model Diagram](./assets/DynamoDB_MessageGroup_Modelling.png)

## Setting up the DynamoDB database
As with most weeks, we begin by using the DEVELOPMENT environment, to test the code and iron out any issues before pushing to production.

## Creating DynamoDB Utility Scripts
Bash Scripts are used for both development and production, with a simple command line execution of adding a variable after the invoking of the script, to set variables within the script
that determine the environment, the table name, et cetera.

An example below, from "./bin/ddb/drop":
```bash
#! /usr/bin/bash
set -e 
if [ -z "$1" ]; then
    echo "No TABLE_NAME argument supplied eg ./bin/ddb/drop cruddur-message prod"
    exit 1
fi
TABLE_NAME="$1"

if [ "$2" = "prod" ]; then
    ENDPOINT_URL=""
else
    ENDPOINT_URL="--endpoint-url=http://localhost:8000"
fi

echo "deleting table: $TABLE_NAME"

aws dynamodb delete-table $ENDPOINT_URL \
--table-name $TABLE_NAME
```

We have the shebang at the start to tell the interpreter that the file should be executed as a bash script.
The command example in the script is useful as an example of what could be entered in the command line for execution.
We have the filename "./bin/ddb/drop", the $1 as "cruddur-message" and $2 as "prod".
$1 sets the TABLE_NAME and $2 acts as a boolean switch for ENDPOINT_URL.
If "prod" is not specified, then the environment defaults to development and "http://localhost:8000" is used.

Other scripts located in "./bin/ddb" are executable in a similar fashion.
The scripts are for:
- dropping pre-existing tables in the database (drop)
- listing the tables in the database (list-tables)
- scanning the database (scan)
- seeding the database with seed data (seed)
- loading the database schema into the database (schema-load)

in "./bin/ddb/patterns":
- retrieving a conversation that in the database from its message_group_uuid (get-conversation)
- listing conversations in the database based on filtering parameters e.g. the sk aka sort key begins with "2023" (list-conversation)

## Cognito Scripts
I also created a script to list the users in the Cognito User Pool;
File: 
"./bin/cognito/list-users". 
This is just for development.

To update the RDS database with the correct Cognito User IDs, I created another script;
File: 
"./bin/db/update-cognito-user-ids".


## Access Pattern Implementation
In the backend code, for the app routing, we are passing values e.g. for retrieving message group data, that retrieve data from the user handle.


## DynamoDB Stream

