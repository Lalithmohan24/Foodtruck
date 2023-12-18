# Foodtruck
# Execution Steps
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

# Note:
  After login users have this interface if they want to add there favourite food add then use that one of the search filter, they use the kilometer radius, facility type, location based search the food truck or cart.

  ![Screenshot from 2023-12-18 16-02-09](https://github.com/Lalithmohan24/Foodtruck/assets/50260612/fdb27358-7808-482b-9f7d-c14f60496c0a)


  

