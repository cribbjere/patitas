from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.db.models import Sum


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

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return (
            f"{self.get_tipo_movimiento_display()} "
            f"- ${self.monto}"
        )


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

    class Meta:
        ordering = ['-fecha_cierre']

    def save(self, *args, **kwargs):
        es_nuevo = self.pk is None

        # Si se edita un cierre existente, no se vuelven a calcular
        # los movimientos del período.
        if not es_nuevo:
            super().save(*args, **kwargs)
            return

        # Obtenemos el cierre anterior antes de guardar el nuevo.
        cierre_anterior = CierreCaja.objects.order_by(
            '-fecha_cierre'
        ).first()

        # Primero se guarda para que Django asigne fecha_cierre.
        super().save(*args, **kwargs)

        movimientos_periodo = MovimientoCaja.objects.filter(
            fecha__lte=self.fecha_cierre
        )

        # Si ya existe un cierre, solamente se toman movimientos
        # posteriores a ese cierre.
        if cierre_anterior:
            movimientos_periodo = movimientos_periodo.filter(
                fecha__gt=cierre_anterior.fecha_cierre
            )

        ingresos = movimientos_periodo.filter(
            tipo_movimiento='ingreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0.00')

        egresos = movimientos_periodo.filter(
            tipo_movimiento='egreso'
        ).aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0.00')

        self.ingresos = ingresos
        self.egresos = egresos
        self.saldo_final = (
            self.saldo_inicial
            + self.ingresos
            - self.egresos
        )

        # Actualizamos sin volver a ejecutar save().
        CierreCaja.objects.filter(
            pk=self.pk
        ).update(
            ingresos=self.ingresos,
            egresos=self.egresos,
            saldo_final=self.saldo_final,
        )

    def __str__(self):
        if not self.fecha_cierre:
            return 'Cierre de caja'

        return (
            f"Cierre "
            f"{self.fecha_cierre.strftime('%d/%m/%Y %H:%M')}"
        )