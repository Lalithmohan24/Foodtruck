# Foodtruck

## Step-1

  Create your mysql database schema then

  update below list items are my .env values

        DBENGINE=<your db engine name>
        DBNAME=<your db schema name>
        DBUSER=<your username>
        DBPASSWORD=<your password>
        HOST=<your host>
        PORT=<your port>
        SECRET_KEY=<your secret key>
        DEBUG=<your debug status>
        ALLOWED_HOSTS=<your host urls>

## Step-2

  Use the below commands to build the docker image

        docker build -t food_truck_project .

  this dockerfile can install the choice python version, pip requirement packages, load the food_truck.csv data to the database table, execute the project on gunicorn server.

## Step-3

  Use the below commands to run the docker build

        docker run -p 8000:8000 food_truck_project
  
