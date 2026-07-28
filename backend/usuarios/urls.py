from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PerfilUsuarioViewSet,
    UsuarioViewSet,
    login,
)

router = DefaultRouter()

router.register(
    r'usuarios',
    UsuarioViewSet,
    basename='usuarios',
)

router.register(
    r'perfiles-usuario',
    PerfilUsuarioViewSet,
    basename='perfiles-usuario',
)

urlpatterns = [
    path('login/', login, name='login'),
]

urlpatterns += router.urls