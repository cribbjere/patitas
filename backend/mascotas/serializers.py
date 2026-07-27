from rest_framework import serializers
from .models import Especie, Mascota


class EspecieSerializer(serializers.ModelSerializer):

    class Meta:
        model = Especie
        fields = '__all__'


class MascotaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Mascota
        fields = '__all__'