from django.db import models
from django.db.models import Sum
from django.contrib.auth.models import User


class MovimientoCaja(models.Model):

    TIPOS_MOVIMIENTO = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
    ]

    MOTIVOS = [
        ('venta', 'Venta'),
        ('compra', 'Compra'),
        ('servicio_clinico', 'Servicio clínico'),
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
    
class CierreCaja(models.Model):

    fecha_cierre = models.DateTimeField(
        auto_now_add=True
    )

    saldo_inicial = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    ingresos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    egresos = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    saldo_final = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='cierres_caja'
    )

    def save(self, *args, **kwargs):

        ingresos = MovimientoCaja.objects.filter(
            tipo_movimiento='ingreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or 0

        egresos = MovimientoCaja.objects.filter(
            tipo_movimiento='egreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or 0

        self.ingresos = ingresos
        self.egresos = egresos
        self.saldo_final = (
            self.saldo_inicial +
            self.ingresos -
            self.egresos
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Cierre {self.fecha_cierre.strftime('%d/%m/%Y')}"
        )
