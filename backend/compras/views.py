from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.views import APIView

from usuarios.permisos import TienePermisoModulo

from .comprobantes import generar_comprobante_compra
from .models import (
    Compra,
    CompraDetalle,
    Proveedor,
)
from .serializers import (
    CompraSerializer,
    DetalleCompraSerializer,
    ProveedorSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all().order_by('nombre')
    serializer_class = ProveedorSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'proveedores'


class CompraViewSet(viewsets.ModelViewSet):
    queryset = (
        Compra.objects
        .select_related(
            'proveedor',
            'usuario',
        )
        .prefetch_related(
            'detalles__producto',
        )
        .order_by(
            '-fecha',
            '-id',
        )
    )

    serializer_class = CompraSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'compras'

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )


class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = (
        CompraDetalle.objects
        .select_related(
            'compra',
            'producto',
        )
        .order_by('-id')
    )

    serializer_class = DetalleCompraSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'compras'


class ComprobanteCompraPDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'compras'

    def get(self, request, compra_id):
        compra = get_object_or_404(
            Compra.objects
            .select_related(
                'proveedor',
                'usuario',
            )
            .prefetch_related(
                'detalles__producto',
            ),
            id=compra_id,
        )

        response = HttpResponse(
            content_type='application/pdf',
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="{compra.numero_comprobante}.pdf"'
        )

        generar_comprobante_compra(
            compra,
            response,
        )

        return response


comprobante_compra_pdf = (
    ComprobanteCompraPDFView.as_view()
)