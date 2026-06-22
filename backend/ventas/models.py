from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from clientes.models import Cliente
from inventario.models import Producto, Stock


class Venta(models.Model):

    fecha = models.DateField()

    numero_comprobante = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='ventas',
        blank=True,
        null=True
    )

    consumidor_final = models.BooleanField(
        default=False
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ventas_registradas'
    )

    def save(self, *args, **kwargs):

        if not self.numero_comprobante:

            ultima_venta = Venta.objects.order_by('id').last()

            if ultima_venta and ultima_venta.numero_comprobante:

                ultimo_numero = int(
                    ultima_venta.numero_comprobante.replace(
                        'VENT-',
                        ''
                    )
                )

            else:
                ultimo_numero = 0

            nuevo_numero = ultimo_numero + 1

            self.numero_comprobante = (
                f"VENT-{nuevo_numero:06d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.numero_comprobante


class DetalleVenta(models.Model):

    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name='detalles'
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='ventas'
    )

    cantidad = models.IntegerField()

    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def clean(self):

        stock = Stock.objects.get(
            producto=self.producto
        )

        if self.cantidad > stock.cantidad_disponible:

            raise ValidationError(
                'No hay stock suficiente para realizar la venta.'
            )

    def save(self, *args, **kwargs):

        self.clean()

        self.precio_unitario = (
            self.producto.precio_venta
        )

        self.subtotal = (
            self.cantidad *
            self.precio_unitario
        )

        super().save(*args, **kwargs)

        total_venta = sum(
            detalle.subtotal
            for detalle in self.venta.detalles.all()
        )

        self.venta.total = total_venta
        self.venta.save()

    def __str__(self):
        return (
            f"{self.producto.descripcion}"
            f" x {self.cantidad}"
        )
