FROM 538323670807.dkr.ecr.us-east-1.amazonaws.com/cruddur-python:3.10-slim-buster

# Inside container
# make a new folder
WORKDIR /backend-flask

# Outside Container -> Inside Container
# this contains the libraries we want to install to run the app
COPY requirements.txt requirements.txt

# Inside Container
# Install the python libraries used for the app
RUN pip3 install -r requirements.txt

# Outside Container -> Inside Container
# means everything in the current directory
# first period . - /backend-flask (outside container)
# second period - /backend-flask (inside container)
COPY . .

EXPOSE ${PORT}

# Added this env to help with debugging, stops Python from buffering so that changes we make in the code will reflect straight away in the terminal
ENV PYTHONUNBUFFERED=1

# CMD (Command)
CMD ["python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=4567", "--debug"]