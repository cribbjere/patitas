from rest_framework import serializers

from .models import (
    Producto,
    Stock,
    MovimientoStock
)


class ProductoSerializer(serializers.ModelSerializer):

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