import json
import psycopg2
import os
import boto3
from botocore.exceptions import ClientError

def get_secret():
    secret_name = "prod/cruddurclone/PostgreSQL"
    region_name = "us-east-1"

    # Create a Secrets Manager client
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print(f"Error retrieving secret: {str(e)}")
        raise e
    except Exception as e:
        print(f"Unknown error occurred: {str(e)}")
        raise e

    # Parse the secret JSON
    secret_dict = json.loads(get_secret_value_response['SecretString'])

    # Construct the connection URL
    connection_url = f"postgresql://{secret_dict['username']}:{secret_dict['password']}@{secret_dict['host']}:{secret_dict['port']}/{secret_dict['dbname']}"
    return connection_url

def lambda_handler(event, context):
    conn = None
    cur = None
    try:
        # Retrieve the secret
        connection_url = get_secret()
        # Connect to the database
        conn = psycopg2.connect(connection_url)
        cur = conn.cursor()

        # Extract the database connection details from the secret
        user = event['request']['userAttributes']
        user_display_name = user['name']
        user_email = user['email']
        user_handle = user['preferred_username']
        user_cognito_id = user['sub']

        sql = """
            INSERT INTO users (
                display_name,
                email,
                handle, 
                cognito_user_id
            ) 
            VALUES (%s,%s,%s,%s)
        """

        params = [user_display_name, user_email, user_handle, user_cognito_id]
        cur.execute(sql, params)
        conn.commit()

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Database or SQL error occurred: {str(error)}")
        # Rollback the transaction on error
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            print('Database connection closed.')
    return event
