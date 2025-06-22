from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

# request -> response
# request handler
def sayhello(request):    
    x=1
    y=1
    z = x + y
    return render(request, 'hello.html',{'name': 'Django'})