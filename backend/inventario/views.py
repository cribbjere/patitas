from rest_framework import viewsets

from .models import (
    Producto,
    Stock,
    MovimientoStock
)

from .serializers import (
    ProductoSerializer,
    StockSerializer,
    MovimientoStockSerializer
)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer


class MovimientoStockViewSet(viewsets.ModelViewSet):
    queryset = MovimientoStock.objects.all()
    serializer_class = MovimientoStockSerializer