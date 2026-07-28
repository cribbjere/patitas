from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PerfilUsuarioViewSet, login

router = DefaultRouter()

router.register(r'perfiles-usuario', PerfilUsuarioViewSet)

urlpatterns = [
    path('login/', login, name='login'),
]

urlpatterns += router.urls