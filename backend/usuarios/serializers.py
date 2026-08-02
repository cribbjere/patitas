from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers

from .models import PerfilUsuario


class PerfilUsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='usuario.username', read_only=True)
    first_name = serializers.CharField(source='usuario.first_name', read_only=True)
    last_name = serializers.CharField(source='usuario.last_name', read_only=True)
    email = serializers.EmailField(source='usuario.email', read_only=True)

    class Meta:
        model = PerfilUsuario
        fields = [
            'id',
            'usuario',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'estado',
            'fecha_creacion',
        ]
        read_only_fields = [
            'id',
            'usuario',
            'fecha_creacion',
        ]


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


class AdministrarUsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.ChoiceField(choices=PerfilUsuario.ROLES)
    estado = serializers.ChoiceField(
        choices=PerfilUsuario.ESTADOS,
        default='activo',
    )
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=6,
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'rol',
            'estado',
        ]
        read_only_fields = ['id']

    def validate_username(self, value):
        consulta = User.objects.filter(username__iexact=value)

        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)

        if consulta.exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con ese nombre.'
            )

        return value

    def validate_email(self, value):
        if not value:
            return value

        consulta = User.objects.filter(email__iexact=value)

        if self.instance:
            consulta = consulta.exclude(pk=self.instance.pk)

        if consulta.exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con ese correo electrónico.'
            )

        return value

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError(
                {
                    'password': (
                        'La contraseña es obligatoria al crear un usuario.'
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        rol = validated_data.pop('rol')
        estado = validated_data.pop('estado', 'activo')
        password = validated_data.pop('password')
        usuario = User.objects.create_user(
        password=password,
        **validated_data,
    )
        usuario.is_active = estado == 'activo'
        usuario.save(update_fields=['is_active'])
        perfil, _ = PerfilUsuario.objects.get_or_create(
        usuario=usuario,
        defaults={
            'rol': rol,
            'estado': estado,
        },
    )
        perfil.rol = rol
        perfil.estado = estado
        perfil.save()
        return usuario

    @transaction.atomic
    def update(self, instance, validated_data):
        rol = validated_data.pop('rol', None)
        estado = validated_data.pop('estado', None)
        password = validated_data.pop('password', None)

        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        if password:
            instance.set_password(password)

        if estado:
            instance.is_active = estado == 'activo'

        instance.save()

        perfil, _ = PerfilUsuario.objects.get_or_create(
            usuario=instance,
            defaults={
                'rol': rol or 'recepcionista',
                'estado': estado or 'activo',
            },
        )

        if rol:
            perfil.rol = rol

        if estado:
            perfil.estado = estado

        perfil.save()

        return instance
    def to_representation(self, instance):
        perfil = getattr(instance, 'perfil', None)

        return {
            'id': instance.id,
            'username': instance.username,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
            'email': instance.email,
            'rol': perfil.rol if perfil else None,
            'estado': perfil.estado if perfil else None,
        }