from rest_framework.routers import DefaultRouter

from .views import TurnoViewSet


router = DefaultRouter()

router.register(r'turnos', TurnoViewSet)

urlpatterns = router.urls