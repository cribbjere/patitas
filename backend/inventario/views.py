from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import (
    LoteStock,
    MovimientoStock,
    Producto,
    Stock,
)
from .serializers import (
    LoteStockSerializer,
    MovimientoStockSerializer,
    ProductoSerializer,
    StockSerializer,
)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = (
        Producto.objects
        .select_related('stock')
        .prefetch_related('lotes')
        .all()
        .order_by('descripcion')
    )
    serializer_class = ProductoSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'productos'


class StockViewSet(viewsets.ModelViewSet):
    queryset = (
        Stock.objects
        .select_related('producto')
        .all()
        .order_by('producto__descripcion')
    )
    serializer_class = StockSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'stock'


class LoteStockViewSet(viewsets.ModelViewSet):
    queryset = (
        LoteStock.objects
        .select_related('producto')
        .all()
        .order_by(
            'fecha_vencimiento',
            'numero_lote',
        )
    )
    serializer_class = LoteStockSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'stock'


class MovimientoStockViewSet(viewsets.ModelViewSet):
    queryset = (
        MovimientoStock.objects
        .select_related(
            'producto',
            'lote',
        )
        .all()
        .order_by(
            '-fecha_movimiento',
            '-id',
        )
    )
    serializer_class = MovimientoStockSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'stock'