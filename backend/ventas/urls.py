from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    VentaViewSet,
    DetalleVentaViewSet,
    comprobante_venta_pdf
)


router = DefaultRouter()

router.register(r'ventas', VentaViewSet)
router.register(r'detalles-venta', DetalleVentaViewSet)


urlpatterns = router.urls + [
    path(
        'ventas/<int:venta_id>/comprobante/',
        comprobante_venta_pdf,
        name='comprobante_venta_pdf'
    ),
]