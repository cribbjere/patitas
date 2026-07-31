from rest_framework.routers import DefaultRouter

from .views import (
    MovimientoCajaViewSet,
    CierreCajaViewSet,
)


router = DefaultRouter()

router.register(
    r'movimientos-caja',
    MovimientoCajaViewSet,
    basename='movimiento-caja'
)

router.register(
    r'cierres-caja',
    CierreCajaViewSet,
    basename='cierre-caja'
)

urlpatterns = router.urls