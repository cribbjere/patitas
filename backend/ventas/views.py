from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.views import APIView

from usuarios.permisos import TienePermisoModulo

from .comprobantes import generar_comprobante_venta
from .models import DetalleVenta, Venta
from .serializers import (
    DetalleVentaSerializer,
    VentaSerializer,
)


class VentaViewSet(viewsets.ModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'ventas'

    queryset = (
        Venta.objects
        .select_related(
            'cliente',
            'usuario',
        )
        .prefetch_related(
            'detalles__producto',
            'detalles__lote',
        )
        .order_by('-fecha', '-id')
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        parametros = self.request.query_params

        cliente_id = (
            parametros.get('cliente')
            or parametros.get('cliente_id')
        )
        fecha = parametros.get('fecha')
        fecha_desde = parametros.get('fecha_desde')
        fecha_hasta = parametros.get('fecha_hasta')
        estado = parametros.get('estado')
        estado_pago = parametros.get('estado_pago')
        metodo_pago = parametros.get('metodo_pago')
        numero_comprobante = parametros.get(
            'numero_comprobante'
        )
        buscar = parametros.get(
            'buscar',
            '',
        ).strip()

        if (
            cliente_id
            and str(cliente_id).isdigit()
        ):
            queryset = queryset.filter(
                cliente_id=int(cliente_id)
            )

        if fecha:
            queryset = queryset.filter(
                fecha=fecha
            )

        if fecha_desde:
            queryset = queryset.filter(
                fecha__gte=fecha_desde
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha__lte=fecha_hasta
            )

        if estado:
            queryset = queryset.filter(
                estado=estado
            )

        if estado_pago:
            queryset = queryset.filter(
                estado_pago=estado_pago
            )

        if metodo_pago:
            queryset = queryset.filter(
                metodo_pago=metodo_pago
            )

        if numero_comprobante:
            queryset = queryset.filter(
                numero_comprobante__icontains=(
                    numero_comprobante
                )
            )

        if buscar:
            queryset = queryset.filter(
                Q(
                    numero_comprobante__icontains=buscar
                )
                | Q(
                    cliente__nombre__icontains=buscar
                )
                | Q(
                    cliente__apellido__icontains=buscar
                )
                | Q(
                    observaciones__icontains=buscar
                )
            )

        return queryset.distinct()


class DetalleVentaViewSet(
    viewsets.ModelViewSet
):
    serializer_class = DetalleVentaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'ventas'

    queryset = (
        DetalleVenta.objects
        .select_related(
            'venta',
            'producto',
            'lote',
        )
        .order_by('-id')
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        parametros = self.request.query_params

        venta_id = parametros.get('venta')
        producto_id = parametros.get('producto')
        lote_id = parametros.get('lote')

        if (
            venta_id
            and str(venta_id).isdigit()
        ):
            queryset = queryset.filter(
                venta_id=int(venta_id)
            )

        if (
            producto_id
            and str(producto_id).isdigit()
        ):
            queryset = queryset.filter(
                producto_id=int(producto_id)
            )

        if (
            lote_id
            and str(lote_id).isdigit()
        ):
            queryset = queryset.filter(
                lote_id=int(lote_id)
            )

        return queryset


class ComprobanteVentaPDFView(APIView):
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'ventas'

    def get(self, request, venta_id):
        venta = get_object_or_404(
            Venta.objects
            .select_related(
                'cliente',
                'usuario',
            )
            .prefetch_related(
                'detalles__producto',
                'detalles__lote',
            ),
            id=venta_id,
        )

        response = HttpResponse(
            content_type='application/pdf'
        )

        response['Content-Disposition'] = (
            'attachment; '
            f'filename="{venta.numero_comprobante}.pdf"'
        )

        generar_comprobante_venta(
            venta,
            response,
        )

        return response


comprobante_venta_pdf = (
    ComprobanteVentaPDFView.as_view()
)