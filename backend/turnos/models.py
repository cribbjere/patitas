from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from clientes.models import Cliente
from mascotas.models import Mascota


class Turno(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('realizado', 'Realizado'),
        ('cancelado', 'Cancelado'),
    ]

    fecha = models.DateField()

    hora = models.TimeField()

    motivo_consulta = models.CharField(
        max_length=150
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='turnos'
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name='turnos'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='turnos_registrados'
    )

    def clean(self):
        if self.mascota and self.cliente:
            if self.mascota.cliente != self.cliente:
                raise ValidationError(
                    'La mascota seleccionada no pertenece al cliente indicado.'
                )

    def __str__(self):
        return f"{self.fecha} {self.hora} - {self.mascota.nombre} ({self.estado})"