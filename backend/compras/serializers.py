from rest_framework import serializers

from .models import (
    Compra,
    CompraDetalle,
    Proveedor
)


class ProveedorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proveedor
        fields = '__all__'


class CompraSerializer(serializers.ModelSerializer):

    class Meta:
        model = Compra
        fields = '__all__'


class DetalleCompraSerializer(serializers.ModelSerializer):

    class Meta:
        model = CompraDetalle
        fields = '__all__'