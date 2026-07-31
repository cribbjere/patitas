from rest_framework import serializers

from .models import (
    MovimientoCaja,
    CierreCaja,
)


class MovimientoCajaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.get_full_name',
        read_only=True,
    )

    tipo_movimiento_nombre = serializers.CharField(
        source='get_tipo_movimiento_display',
        read_only=True,
    )

    motivo_nombre = serializers.CharField(
        source='get_motivo_display',
        read_only=True,
    )

    class Meta:
        model = MovimientoCaja

        fields = [
            'id',
            'fecha',
            'tipo_movimiento',
            'tipo_movimiento_nombre',
            'motivo',
            'motivo_nombre',
            'descripcion',
            'monto',
            'usuario',
            'usuario_nombre',
        ]

        read_only_fields = [
            'id',
            'fecha',
            'usuario',
            'usuario_nombre',
            'tipo_movimiento_nombre',
            'motivo_nombre',
        ]

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'El monto debe ser mayor que cero.'
            )

        return value


class CierreCajaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.get_full_name',
        read_only=True,
    )

    class Meta:
        model = CierreCaja

        fields = [
            'id',
            'fecha_cierre',
            'saldo_inicial',
            'ingresos',
            'egresos',
            'saldo_final',
            'observaciones',
            'usuario',
            'usuario_nombre',
        ]

        read_only_fields = [
            'id',
            'fecha_cierre',
            'ingresos',
            'egresos',
            'saldo_final',
            'usuario',
            'usuario_nombre',
        ]

    def validate_saldo_inicial(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'El saldo inicial no puede ser negativo.'
            )

        return value