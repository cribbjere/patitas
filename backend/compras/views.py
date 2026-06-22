from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from .models import (
    Compra, 
    CompraDetalle, 
    Proveedor
)

from .comprobantes import generar_comprobante_compra
from rest_framework import viewsets
from .serializers import (
    ProveedorSerializer,
    CompraSerializer,
    DetalleCompraSerializer
)

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer


class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer


class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = CompraDetalle.objects.all()
    serializer_class = DetalleCompraSerializer

def comprobante_compra_pdf(request, compra_id):

    compra = get_object_or_404(Compra, id=compra_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="{compra.numero_comprobante}.pdf"'
    )

    generar_comprobante_compra(compra, response)

    return response