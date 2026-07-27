from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models

from clientes.models import Cliente
from mascotas.models import Mascota


class Turno(models.Model):

    ESTADOS = [
        ("pendiente", "Programado"),
        ("realizado", "Realizado"),
        ("cancelado", "Cancelado"),
        ("ausente", "Ausente"),
    ]

    fecha = models.DateField()

    hora = models.TimeField()

    hora_fin = models.TimeField()

    motivo_consulta = models.CharField(
        max_length=150
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name="turnos"
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name="turnos"
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="turnos_registrados",
        null=True,
        blank=True
    )

    def clean(self):
        if self.mascota_id and self.cliente_id:
            if self.mascota.cliente_id != self.cliente_id:
                raise ValidationError(
                    "La mascota seleccionada no pertenece al cliente indicado."
                )

        if self.hora and self.hora_fin:
            if self.hora_fin <= self.hora:
                raise ValidationError(
                    "La hora de finalización debe ser posterior a la hora de inicio."
                )

    def __str__(self):
        return (
            f"{self.fecha} {self.hora} - "
            f"{self.mascota.nombre} ({self.estado})"
        )