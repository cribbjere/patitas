from rest_framework import serializers

from .models import (
    Consulta,
    Vacunacion,
    Cirugia,
    ServicioHigiene
)


class ConsultaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )

    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = [
            'usuario',
            'usuario_nombre',
            'precio'
        ]

class VacunacionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )

    class Meta:
        model = Vacunacion
        fields = '__all__'
        read_only_fields = [
            'usuario',
            'usuario_nombre',
            'precio'
        ]


class CirugiaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )

    class Meta:
        model = Cirugia
        fields = '__all__'
        read_only_fields = [
            'usuario',
            'precio'
        ]


class ServicioHigieneSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True
    )

    class Meta:
        model = ServicioHigiene
        fields = '__all__'
        read_only_fields = [
            'usuario',
            'precio'
        ]