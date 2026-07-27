from rest_framework import serializers

from .models import (
    MovimientoCaja,
    CierreCaja
)


class MovimientoCajaSerializer(serializers.ModelSerializer):

    class Meta:
        model = MovimientoCaja
        fields = '__all__'


class CierreCajaSerializer(serializers.ModelSerializer):

    class Meta:
        model = CierreCaja
        fields = '__all__'