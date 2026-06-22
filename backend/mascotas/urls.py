from rest_framework.routers import DefaultRouter

from .views import EspecieViewSet, MascotaViewSet


router = DefaultRouter()

router.register(r'especies', EspecieViewSet)
router.register(r'mascotas', MascotaViewSet)

urlpatterns = router.urls