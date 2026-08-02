from django.contrib.auth.models import User
from django.contrib.auth.password_validation import (
    validate_password,
)
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import serializers

from .models import PerfilUsuario


class PerfilUsuarioSerializer(
    serializers.ModelSerializer
):
    username = serializers.CharField(
        source='usuario.username',
        read_only=True,
    )

    first_name = serializers.CharField(
        source='usuario.first_name',
        read_only=True,
    )

    last_name = serializers.CharField(
        source='usuario.last_name',
        read_only=True,
    )

    email = serializers.EmailField(
        source='usuario.email',
        read_only=True,
    )

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
            'debe_cambiar_password',
            'fecha_creacion',
        ]

        read_only_fields = [
            'id',
            'usuario',
            'fecha_creacion',
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
    )


class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    estado = serializers.SerializerMethodField()
    debe_cambiar_password = (
        serializers.SerializerMethodField()
    )

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
            'debe_cambiar_password',
        ]

    def get_rol(self, usuario):
        perfil = getattr(usuario, 'perfil', None)

        if usuario.is_superuser and not perfil:
            return 'administrador'

        return perfil.rol if perfil else None

    def get_estado(self, usuario):
        perfil = getattr(usuario, 'perfil', None)

        if usuario.is_superuser and not perfil:
            return (
                'activo'
                if usuario.is_active
                else 'inactivo'
            )

        return perfil.estado if perfil else None

    def get_debe_cambiar_password(self, usuario):
        perfil = getattr(usuario, 'perfil', None)

        return (
            perfil.debe_cambiar_password
            if perfil
            else False
        )


class AdministrarUsuarioSerializer(
    serializers.ModelSerializer
):
    rol = serializers.ChoiceField(
        choices=PerfilUsuario.ROLES,
    )

    estado = serializers.ChoiceField(
        choices=PerfilUsuario.ESTADOS,
        default='activo',
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=6,
    )

    debe_cambiar_password = serializers.BooleanField(
        read_only=True,
        source='perfil.debe_cambiar_password',
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
            'debe_cambiar_password',
        ]

        read_only_fields = [
            'id',
            'debe_cambiar_password',
        ]

    def validate_username(self, value):
        consulta = User.objects.filter(
            username__iexact=value
        )

        if self.instance:
            consulta = consulta.exclude(
                pk=self.instance.pk
            )

        if consulta.exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con ese nombre.'
            )

        return value

    def validate_email(self, value):
        if not value:
            return value

        consulta = User.objects.filter(
            email__iexact=value
        )

        if self.instance:
            consulta = consulta.exclude(
                pk=self.instance.pk
            )

        if consulta.exists():
            raise serializers.ValidationError(
                'Ya existe un usuario con ese '
                'correo electrónico.'
            )

        return value

    def validate(self, attrs):
        if (
            self.instance is None
            and not attrs.get('password')
        ):
            raise serializers.ValidationError(
                {
                    'password': (
                        'La contraseña es obligatoria '
                        'al crear un usuario.'
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        rol = validated_data.pop('rol')
        estado = validated_data.pop(
            'estado',
            'activo',
        )
        password = validated_data.pop('password')

        usuario = User.objects.create_user(
            password=password,
            **validated_data,
        )

        usuario.is_active = estado == 'activo'

        usuario.save(
            update_fields=['is_active']
        )

        perfil, _ = (
            PerfilUsuario.objects.get_or_create(
                usuario=usuario,
                defaults={
                    'rol': rol,
                    'estado': estado,
                    'debe_cambiar_password': True,
                },
            )
        )

        perfil.rol = rol
        perfil.estado = estado
        perfil.debe_cambiar_password = True

        perfil.save()

        return usuario

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):
        rol = validated_data.pop('rol', None)
        estado = validated_data.pop('estado', None)
        password = validated_data.pop(
            'password',
            None,
        )

        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)

        if password:
            instance.set_password(password)

        if estado:
            instance.is_active = (
                estado == 'activo'
            )

        instance.save()

        perfil, _ = (
            PerfilUsuario.objects.get_or_create(
                usuario=instance,
                defaults={
                    'rol': rol or 'recepcionista',
                    'estado': estado or 'activo',
                    'debe_cambiar_password': (
                        bool(password)
                    ),
                },
            )
        )

        if rol:
            perfil.rol = rol

        if estado:
            perfil.estado = estado

        if password:
            perfil.debe_cambiar_password = True

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
            'estado': (
                perfil.estado
                if perfil
                else (
                    'activo'
                    if instance.is_active
                    else 'inactivo'
                )
            ),
            'debe_cambiar_password': (
                perfil.debe_cambiar_password
                if perfil
                else False
            ),
        }


class CambiarPasswordSerializer(
    serializers.Serializer
):
    password_actual = serializers.CharField(
        write_only=True,
    )

    password_nueva = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirmacion = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    def validate_password_actual(self, value):
        usuario = self.context['request'].user

        if not usuario.check_password(value):
            raise serializers.ValidationError(
                'La contraseña actual es incorrecta.'
            )

        return value

    def validate(self, attrs):
        password_nueva = attrs.get(
            'password_nueva'
        )
        confirmacion = attrs.get(
            'password_confirmacion'
        )

        if password_nueva != confirmacion:
            raise serializers.ValidationError(
                {
                    'password_confirmacion': (
                        'Las contraseñas no coinciden.'
                    )
                }
            )

        usuario = self.context['request'].user

        if usuario.check_password(password_nueva):
            raise serializers.ValidationError(
                {
                    'password_nueva': (
                        'La contraseña nueva debe ser '
                        'diferente de la actual.'
                    )
                }
            )

        try:
            validate_password(
                password_nueva,
                user=usuario,
            )
        except ValidationError as error:
            raise serializers.ValidationError(
                {
                    'password_nueva': list(
                        error.messages
                    )
                }
            )

        return attrs

    @transaction.atomic
    def save(self, **kwargs):
        usuario = self.context['request'].user

        usuario.set_password(
            self.validated_data['password_nueva']
        )

        usuario.save(
            update_fields=['password']
        )

        perfil = getattr(usuario, 'perfil', None)

        if perfil:
            perfil.debe_cambiar_password = False

            perfil.save(
                update_fields=[
                    'debe_cambiar_password'
                ]
            )

        return usuario


class RestablecerPasswordSerializer(
    serializers.Serializer
):
    password_temporal = serializers.CharField(
        write_only=True,
        min_length=6,
    )

    password_confirmacion = serializers.CharField(
        write_only=True,
        min_length=6,
    )

    def validate(self, attrs):
        if (
            attrs['password_temporal']
            != attrs['password_confirmacion']
        ):
            raise serializers.ValidationError(
                {
                    'password_confirmacion': (
                        'Las contraseñas no coinciden.'
                    )
                }
            )

        return attrs

    @transaction.atomic
    def guardar_para_usuario(self, usuario):
        usuario.set_password(
            self.validated_data[
                'password_temporal'
            ]
        )

        usuario.save(
            update_fields=['password']
        )

        perfil, _ = (
            PerfilUsuario.objects.get_or_create(
                usuario=usuario,
                defaults={
                    'rol': 'recepcionista',
                    'estado': 'activo',
                    'debe_cambiar_password': True,
                },
            )
        )

        perfil.debe_cambiar_password = True

        perfil.save(
            update_fields=[
                'debe_cambiar_password'
            ]
        )

        return usuario