# Week 4 - RDS Database

## RDS
Setting up the RDS database

The purpose with the RDS database (postgreSQL) is to store certain data and allow queries in a structured manner.


There are some scripts that we can use with the database to be able to perform simple configuration (schema loads, dropping tables/databases, seeding the db with test data, listing connections to the db and killing connections when necessary in the dev environment)
N.B. KILLING CONNECTIONS IN A PRODUCTION DB FORCEFULLY IS BAD PRACTICE AND CAN CAUSE ISSUES.

We will also want to consider using RDS Proxy at a certain point, and configuring the application tier of the application to query the RDS Proxy endpoint.

This may take place in the app.py in the connection pool stuff that happens in the psycopg PostgreSQL driver for Python.

## Database Explorer in VS Code
- Tip: stay away from using this as it opens the connections to the db and doesn't necessarily close them.

## Scripts
- Frameworks such as Rails have things configured for databases such as schema-load, create, seed, drop, migrate etc. and we are using Flask for the backend framework.
- We aren't using such a framework, so we are adding some simple scripts to enable us to do these how we want, with more flexibility.

in our `db-setup` script, we run some other db scripts, namely:
- `db-drop`
- `db-create`
- `db-schema-load`
- `db-seed`

This just speeds the process of setting up and configuring a development database for testing purposes.


## Connection Pooling
The logic behind connection pooling is that we can reuse connections and manage this more efficiently than simply having connections that cannot be managed. For example, if we tried to use Lambda without RDS Proxy, then we would be unable to manage connections from the Lambda runtime environment. However, if we use something like psycopg and manage our connections within our containerized application codebase running on ECS, then we are able to manage the connections.

## Psycopg
The way we work with psycopg is to import it, then create a connection to the database, then create a cursor within which we can execute queries.

The intention is to use the binary and use connection pooling.

We add `psycopg[binary]` and `psycopg[pool]` to our `requirements.txt`

```py
import psycopg2

# Establish a connection
conn = psycopg2.connect("dbname=mydatabase user=myuser password=mypassword host=localhost")

# Create a cursor
cursor = conn.cursor()
# Execute a SELECT query
cursor.execute("SELECT * FROM mytable")
records = cursor.fetchall()
```

### Parameterized Queries
`Parameterized queries` are supported. This allows us to enhance security be preventing SQL injection attacks, which is crucial for handling user input and ensuring the integrity of the database.

```py
# Parameterized query
cursor.execute("INSERT INTO mytable (column1, column2) VALUES (%s, %s)", (value1, value2))
```

### Transaction Management

```py

# Commit changes
conn.commit()

# Rollback changes
conn.rollback()

```


### Using raw SQL and converting to JSON directly
- We can return data and organise it into a data type structure and then manipulate it.
- It can be preferable to return raw JSON from the database and pass that along, to avoid reduction in API performance from poor usage of queries to the database
- If you have an Object Relational Mapper, you aren't using your database intelligently
- When you can use raw SQL then you can return JSON directly and this means we can manipulate this data how we choose in the code
- Postgres has built in functions where you can take results and return them as json strings, directly in postgres using methods
    - This makes it more efficient than letting an intermediate language (Python/Ruby etc) handle it
    - For the most part if you can let Postgres handle this aspect, you should

### query_wrap_array
We use some wrappers in our code, to essentially structure the queries in a way such that they will return nicely as json, for example:

`db.py`:

```py

 def query_wrap_object(self, template):
    sql = f"""
    (SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
    {template}
    ) object_row);
    """
    return sql

  def query_wrap_array(self, template):
    sql = f"""
    (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
    {template}
    ) array_row);
    """
    return sql

```

Both of these functions essentially convert the array or object that is being returned from the query into json, plugging the query in as an argument.


### Updating the Security Group in development for RDS
- When trying to connect to the DB using the PROD_CONNECTION_URL string, the connection will hang if the networking to the database is not configured to allow inbound traffic to the instance.

During development, we are solving this by updating the security group for the db instance and adding an Inbound Rule to allow traffic from the Gitpod IP (as we are using Gitpod for development) using `curl ifconfig.me` and storing this in a GITPOD_IP environment variable.

We then update the Security Group using the CLI programatically, with the IP and the relevant port and protocol, adding PostgreSQL as the `Type` and putting `GITPOD` in the description of the rule.

Initially we did this by making a script to update the SG rule, however later on we updated the Gitpod configuration so that the `Gitpod.yml` has it defined as a task on startup to update the SG rule so that the workspace will do this automatically on the launch of a workspace.

Of course this only really works if we are developing in isolation, but this is arguably the quickest and most efficient way of doing it.

How would we solve this issue for multiple developers?

```
Solving for Multiple Developers:

Dynamic Gitpod IPs:

Explore the possibility of Gitpod providing a dynamic list of IPs for workspaces. If available, use this list to dynamically update the SG.

Developer-Specific Rules:

Consider adding developer-specific rules to the SG, allowing each developer to have their own defined IP range for access.
IAM Role Usage:

If developers have consistent IP addresses or ranges, IAM roles could be explored to manage access. However, this might not be as flexible as dynamically updating based on Gitpod IPs.

```


## Cognito Post Confirmation Lambda
Post confirmation lambda is there once the user has registered and confirmed their email. 

We are using a lambda function in order to take the values that the user inputs on signup and insert that data in a structured way into the RDS postgres database. 

In order to secure against SQL injection, we are using parameterized values in the write to the database.

Also, we would want to use RDS Proxy for production to make sure that the database connections are highly available for the lambdas that are being spun up, for example if you have thousands of users trying to sign up, you would get potentially thousands of lambda invocations.

The purpose of it is to allow the signup process to be handled separately from the web tier, decoupling the componenets to improve scalability and maintainability, and for asynchronous execution which allows for parallel processing and quick response times. 

We aren't configuring it to use RDS Proxy also because we would need to use Secrets Manager which would incur additional cost.

We need an AWSLambdaVPCAccessExecutionRole, which allows us to create, delete, and describe network interfaces.

## Creating Activities
The activities are displayed on the user's home feed page. The implementation of the code is in `home_activities.py`, and retrieves results from the database of the activities of the user.

The data returned has a uuid, display name and handle, message, a count of replies, reposts, and likes, expiry and creation timestamp, and a reply to activity uuid.


using the `RETURNING` keyword in SQL will help us query the data efficiently, returning the id of the last inserted row in the same write.

We separate out the SQL templates for different queries to the database (e.g. Create Activity) and put them in an `sql` folder.
We then call this in the specific service definitions e.g. `create_activity.py`, 


## Accessing Global Object in Flask
You can import current_app from flask, it stores its reference in the global application object.

```py

from flask import current_app as app

```


