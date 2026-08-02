from django.contrib.auth.models import User
from django.db import models


class PerfilUsuario(models.Model):

    ROLES = [
        ('administrador', 'Administrador'),
        ('recepcionista', 'Recepcionista'),
        ('veterinario', 'Veterinario'),
        ('ventas', 'Ventas'),
        ('higiene', 'Higiene'),
    ]

    ESTADOS = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='perfil',
    )

    rol = models.CharField(
        max_length=20,
        choices=ROLES,
    )

    estado = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default='activo',
    )

    debe_cambiar_password = models.BooleanField(
        default=False,
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f"{self.usuario.username} - "
            f"{self.get_rol_display()}"
        )