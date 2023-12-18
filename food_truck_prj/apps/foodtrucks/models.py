from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class FoodTruck(models.Model):
    FacilityType = models.CharField(max_length=255)
    LocationDescription = models.CharField(max_length=255)
    Address = models.CharField(max_length=255)
    Status = models.CharField(max_length=255)
    FoodItems = models.TextField()  # Assuming FoodItems can be longer descriptions
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    dayshours = models.CharField(max_length=255)
    Approved = models.DateTimeField()
    ExpirationDate = models.DateTimeField()
    ZipCodes = models.BigIntegerField()  # Assuming zip code is a string
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.FacilityType} - {self.LocationDescription}"
    

class FavoriteFood(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food_name = models.CharField(max_length=255)

    def __str__(self):
        return self.food_name
    
