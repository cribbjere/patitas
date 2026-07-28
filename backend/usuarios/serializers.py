from django.contrib.auth.models import User
from rest_framework import serializers

from .models import PerfilUsuario


class PerfilUsuarioSerializer(serializers.ModelSerializer):

    class Meta:
        model = PerfilUsuario
        fields = '__all__'


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UsuarioSerializer(serializers.ModelSerializer):

    rol = serializers.CharField(source='perfil.rol', read_only=True)
    estado = serializers.CharField(source='perfil.estado', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'estado',
        ]