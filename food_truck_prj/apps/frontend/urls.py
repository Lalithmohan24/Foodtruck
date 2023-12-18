from django.urls import path
from django.contrib.auth.decorators import login_required
from apps.frontend import views

urlpatterns = [

    path('', views.initial_page,name='Initial Page'),
    path('main/', views.main_page,name='Main Page'),
]