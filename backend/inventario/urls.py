from rest_framework.routers import DefaultRouter

from .views import (
    ProductoViewSet,
    StockViewSet,
    MovimientoStockViewSet
)

router = DefaultRouter()

router.register(r'productos', ProductoViewSet)
router.register(r'stock', StockViewSet)
router.register(r'movimientos-stock', MovimientoStockViewSet)

urlpatterns = router.urls