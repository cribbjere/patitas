from django.db import models
from django.contrib.auth.models import User


class MovimientoCaja(models.Model):

    TIPOS_MOVIMIENTO = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
    ]

    MOTIVOS = [
        ('venta', 'Venta'),
        ('compra', 'Compra'),
        ('ajuste_manual', 'Ajuste manual'),
    ]

    fecha = models.DateTimeField(
        auto_now_add=True
    )

    tipo_movimiento = models.CharField(
        max_length=20,
        choices=TIPOS_MOVIMIENTO
    )

    motivo = models.CharField(
        max_length=30,
        choices=MOTIVOS
    )

    descripcion = models.CharField(
        max_length=150
    )

    monto = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='movimientos_caja'
    )

    def __str__(self):
        return f"{self.tipo_movimiento} - ${self.monto}"