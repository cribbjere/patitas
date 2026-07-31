from rest_framework.routers import DefaultRouter

from .views import (
    ProductoViewSet,
    StockViewSet,
    LoteStockViewSet,
    MovimientoStockViewSet,
)

router = DefaultRouter()

router.register(
    r'productos',
    ProductoViewSet
)

router.register(
    r'stock',
    StockViewSet
)

router.register(
    r'lotes-stock',
    LoteStockViewSet
)

router.register(
    r'movimientos-stock',
    MovimientoStockViewSet
)

urlpatterns = router.urls