from rest_framework import serializers

from .models import (
    Consulta,
    Vacunacion,
    Cirugia,
    ServicioHigiene
)


class ConsultaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Consulta
        fields = '__all__'


class VacunacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vacunacion
        fields = '__all__'


class CirugiaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cirugia
        fields = '__all__'


class ServicioHigieneSerializer(serializers.ModelSerializer):

    class Meta:
        model = ServicioHigiene
        fields = '__all__'