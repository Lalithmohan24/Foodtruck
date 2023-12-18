import logging

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

from django.contrib.auth import authenticate
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone

from apps.foodtrucks.models import FavoriteFood, FoodTruck
from apps.foodtrucks.serialilzers import FoodTruckSerializers, UserSerializer, RegisterSerializer, LoginSerializer, FavoriteFoodSerializer
from apps.foodtrucks.utils import json

logger = logging.getLogger( __name__ )
import pytz
from datetime import datetime

now = datetime.now(pytz.timezone('UTC'))
current_date = now.date()
current_time = now.time()

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Use timedelta for expiry
            expiry = timezone.timedelta(days=1)  # Adjust the expiration duration as needed

            # Create Token with expiry
            token, created = Token.objects.get_or_create(user=user)
            token.expires = timezone.now() + expiry
            token.save()

            logger.info(f"{current_date} {current_time} : New User register")
            return json.Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "token": token.key
            }, 'User Created Successfully', 200, True)
        except Exception as e:
            logger.info(f"{current_date} {current_time} : {e}: Failed to register New User")
            return json.Response({str(e)}, 'Invalid credentials', 400, False)

class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            # Get the username and password from the serializer
            username = serializer.validated_data.get('username', None)
            password = serializer.validated_data.get('password', None)

            # Add logic to authenticate the user based on the provided username and password
            user = authenticate(username=username, password=password)

            if user is not None:
                # Use timedelta for expiry
                expiry = timezone.timedelta(days=1)  # Adjust the expiration duration as needed

                # Create Token with expiry
                token, created = Token.objects.get_or_create(user=user)
                token.expires = timezone.now() + expiry
                token.save()

                logger.info(f"{current_date} {current_time} : Login Successfully")
                return json.Response({
                    "user": UserSerializer(user, context=self.get_serializer_context()).data,
                    "token": token.key
                }, 'Login SuccessFully', 200, True)
            else:
                logger.info(f"{current_date} {current_time} : {e}: Faild to Login")
                return json.Response({}, 'Invalid credentials', 400, False)
        except Exception as e:
                logger.info(f"{current_date} {current_time} : {e}: Failed to Login")
                return json.Response({}, 'Invalid credentials', 400, False)
    
class FoodTruckPagination(PageNumberPagination):
    page_size = 10  # Adjust the page size as needed

@method_decorator(csrf_exempt, name='dispatch')
class SearchTruck(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request):
        try:
            facility_type = request.query_params.get('facility_type')
            location = request.query_params.get('location').split(',')
            lat = float(location[0])
            long = float(location[1])
            radius = int(request.query_params.get('radius'))
            today = timezone.now()
            print(today)
            if 'favourite' in request.GET:
                favourite = request.query_params.get('favourite')
                queryset = FoodTruck.objects.filter(
                    FacilityType=facility_type,
                    Status='APPROVED',
                    ExpirationDate__gte=today,
                    Latitude__range=(lat - radius, lat + radius),
                    Longitude__range=(long - radius, long + radius),
                    FoodItems__icontains=favourite
                )
                print(queryset)
            else:
                queryset = FoodTruck.objects.filter(
                    FacilityType=facility_type,
                    Status='APPROVED',
                    ExpirationDate__gte=today,
                    Latitude__range=(lat - radius, lat + radius),
                    Longitude__range=(long - radius, long + radius)
                )
                print(queryset)

            # Apply pagination to the queryset
            paginator = FoodTruckPagination()
            # paginator = PageNumberPagination()
            paginated_query = paginator.paginate_queryset(queryset, request)

            # Serialize the paginated queryset
            serializers = FoodTruckSerializers(paginated_query, many=True)

            # Build the response with pagination information
            response_data = {
                'data': serializers.data,
                'records': len(serializers.data),
                'pagination': {
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link(),
                'count': paginator.page.paginator.count,
                },
            }
            logger.info(f"{current_date} {current_time} : Nearby Foodtrucks get successfully")
            return json.Response(response_data, 'Listed Street Food successfully', 200, True)
        except Exception as e:
            logger.info(f"{current_date} {current_time} : {e} : Failed to get Nearby Foodtrucks")
            return json.Response({"data":[str(e)]},"Please Enter the correct column name and keywords", 200,True)

@method_decorator(csrf_exempt, name='dispatch')
class FavoriteFoodViewset(viewsets.ViewSet):
    queryset = FavoriteFood
    seriealizer_class = FavoriteFoodSerializer

    def list(self, requeset):
        try:
            user = requeset.user
            foods = self.queryset.objects.filter(user=user.id)
            # foods = FavoriteFood.objects.filter(user=user.id)
            serializer = self.seriealizer_class(foods, many=True)
            logger.info(f"{current_date} {current_time} : List get Successfully")
            return json.Response(serializer.data, 'List get Successfully', 200, True)
        except Exception as e:
            logger.info(f"{current_date} {current_time} : {e} : List get Successfully")
            return json.Response({"data":[str(e)]},"Failed to get List", 200,True)

    def create(self, request, *args, **kwargs):
        try:
            datas = request.data
            datas['user'] = request.user.id
            serializer = self.seriealizer_class(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            logger.info(f"{current_date} {current_time} : Favourite Food created Successfully")
            return json.Response(serializer.data, 'Favourite Food created Successfully', 201, True)
        except Exception as e:
            logger.info(f"{current_date} {current_time} : {e} : Failed to create Food")
            return json.Response({"data":[str(e)]},"Failed to create Food", 200,True)

