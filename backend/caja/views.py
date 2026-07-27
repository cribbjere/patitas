from rest_framework import viewsets

from .models import (
    MovimientoCaja,
    CierreCaja
)

from .serializers import (
    MovimientoCajaSerializer,
    CierreCajaSerializer
)


class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.all()
    serializer_class = MovimientoCajaSerializer


class CierreCajaViewSet(viewsets.ModelViewSet):
    queryset = CierreCaja.objects.all()
    serializer_class = CierreCajaSerializer