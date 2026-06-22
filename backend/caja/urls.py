from rest_framework.routers import DefaultRouter

from .views import (
    MovimientoCajaViewSet,
    CierreCajaViewSet
)


router = DefaultRouter()

router.register(r'movimientos-caja', MovimientoCajaViewSet)
router.register(r'cierres-caja', CierreCajaViewSet)

urlpatterns = router.urls