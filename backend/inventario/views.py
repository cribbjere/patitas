from rest_framework import viewsets

from .models import (
    Producto,
    Stock,
    LoteStock,
    MovimientoStock,
)

from .serializers import (
    ProductoSerializer,
    StockSerializer,
    LoteStockSerializer,
    MovimientoStockSerializer,
)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class LoteStockViewSet(viewsets.ModelViewSet):
    queryset = LoteStock.objects.select_related(
        'producto'
    ).all()

    serializer_class = LoteStockSerializer


class MovimientoStockViewSet(viewsets.ModelViewSet):
    queryset = MovimientoStock.objects.all()
    serializer_class = MovimientoStockSerializer