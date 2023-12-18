# Create your views here.

from django.shortcuts import render, redirect
from django.urls import reverse

def initial_page(request):
    return render(request, 'index.html')

def main_page(request):
    return render(request, 'main.html')
