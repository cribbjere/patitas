from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import (
    CierreCaja,
    MovimientoCaja,
)
from .serializers import (
    CierreCajaSerializer,
    MovimientoCajaSerializer,
)


class MovimientoCajaViewSet(viewsets.ModelViewSet):
    serializer_class = MovimientoCajaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'caja'

    # Recepción y Ventas pueden consultar movimientos,
    # pero no crear, editar ni eliminar ajustes manuales.
    roles_solo_lectura = {
        'recepcionista',
        'ventas',
    }

    def get_queryset(self):
        queryset = (
            MovimientoCaja.objects
            .select_related('usuario')
            .order_by('-fecha', '-id')
        )

        tipo_movimiento = (
            self.request.query_params.get(
                'tipo_movimiento'
            )
        )

        motivo = self.request.query_params.get(
            'motivo'
        )

        fecha_desde = (
            self.request.query_params.get(
                'fecha_desde'
            )
        )

        fecha_hasta = (
            self.request.query_params.get(
                'fecha_hasta'
            )
        )

        if tipo_movimiento:
            queryset = queryset.filter(
                tipo_movimiento=tipo_movimiento
            )

        if motivo:
            queryset = queryset.filter(
                motivo=motivo
            )

        if fecha_desde:
            queryset = queryset.filter(
                fecha__date__gte=fecha_desde
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha__date__lte=fecha_hasta
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user
        )


class CierreCajaViewSet(viewsets.ModelViewSet):
    serializer_class = CierreCajaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'caja'

    # Los cierres son exclusivamente administrativos.
    roles_permitidos = {
        'administrador',
    }

    def get_queryset(self):
        queryset = (
            CierreCaja.objects
            .select_related('usuario')
            .order_by('-fecha_cierre', '-id')
        )

        fecha_desde = (
            self.request.query_params.get(
                'fecha_desde'
            )
        )

        fecha_hasta = (
            self.request.query_params.get(
                'fecha_hasta'
            )
        )

        if fecha_desde:
            queryset = queryset.filter(
                fecha_cierre__date__gte=fecha_desde
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha_cierre__date__lte=fecha_hasta
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user
        )