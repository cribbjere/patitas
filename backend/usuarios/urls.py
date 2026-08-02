from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PerfilUsuarioViewSet,
    UsuarioViewSet,
    cambiar_password,
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
    path(
        'login/',
        login,
        name='login',
    ),
    path(
        'cambiar-password/',
        cambiar_password,
        name='cambiar-password',
    ),
]

urlpatterns += router.urls