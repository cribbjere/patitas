from rest_framework import serializers

from .models import (
    Producto,
    Stock,
    LoteStock,
    MovimientoStock,
)


class LoteStockSerializer(serializers.ModelSerializer):

    class Meta:
        model = LoteStock
        fields = '__all__'
        read_only_fields = [
            'fecha_ingreso',
            'ultima_actualizacion',
        ]

    def validate_cantidad_disponible(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'La cantidad disponible no puede ser negativa.'
            )

        return value

    def validate_costo_unitario(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'El costo unitario no puede ser negativo.'
            )

        return value


class ProductoSerializer(serializers.ModelSerializer):
    lotes = LoteStockSerializer(
        many=True,
        read_only=True
    )

    stock_actual = serializers.IntegerField(
        source='stock.cantidad_disponible',
        read_only=True
    )

    class Meta:
        model = Producto
        fields = '__all__'


class StockSerializer(serializers.ModelSerializer):

    class Meta:
        model = Stock
        fields = '__all__'


class MovimientoStockSerializer(serializers.ModelSerializer):

    class Meta:
        model = MovimientoStock
        fields = '__all__'