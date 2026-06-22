from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from .models import (
    Venta,
    DetalleVenta
)
from .comprobantes import generar_comprobante_venta
from .serializers import (
    VentaSerializer,
    DetalleVentaSerializer
)

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer


class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer

def comprobante_venta_pdf(request, venta_id):

    venta = get_object_or_404(Venta, id=venta_id)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = (
        f'attachment; filename="{venta.numero_comprobante}.pdf"'
    )

    generar_comprobante_venta(venta, response)

    return response