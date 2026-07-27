from rest_framework.routers import DefaultRouter

from .views import PerfilUsuarioViewSet


router = DefaultRouter()

router.register(r'perfiles-usuario', PerfilUsuarioViewSet)

urlpatterns = router.urls