from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ProveedorViewSet,
    CompraViewSet,
    DetalleCompraViewSet,
    comprobante_compra_pdf
)

router = DefaultRouter()

router.register(r'proveedores', ProveedorViewSet)
router.register(r'compras', CompraViewSet)
router.register(r'detalles-compra', DetalleCompraViewSet)

urlpatterns = router.urls + [

    path(
        'compras/<int:compra_id>/comprobante/',
        comprobante_compra_pdf,
        name='comprobante_compra_pdf'
    ),
]