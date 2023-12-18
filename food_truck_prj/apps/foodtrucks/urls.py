from django.urls import path
from apps.foodtrucks import views

urlpatterns = [
    path('search/', views.SearchTruck.as_view(),name='search_food_truck'),
    path('register/', views.RegisterAPI.as_view(), name='register'),
    path('login/', views.LoginAPI.as_view(), name='login'),
    path('favorite_food/', views.FavoriteFoodViewset.as_view({'get': 'list', 'post': 'create'}), name='favorite-food-list-create'),
]