from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import (
    MovimientoCaja,
    CierreCaja,
)

from .serializers import (
    MovimientoCajaSerializer,
    CierreCajaSerializer,
)


class MovimientoCajaViewSet(viewsets.ModelViewSet):
    serializer_class = MovimientoCajaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MovimientoCaja.objects.select_related(
            'usuario'
        ).order_by('-fecha')

        tipo_movimiento = self.request.query_params.get(
            'tipo_movimiento'
        )

        motivo = self.request.query_params.get('motivo')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CierreCaja.objects.select_related(
            'usuario'
        ).order_by('-fecha_cierre')

        fecha_desde = self.request.query_params.get(
            'fecha_desde'
        )

        fecha_hasta = self.request.query_params.get(
            'fecha_hasta'
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