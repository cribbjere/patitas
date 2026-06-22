from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from clientes.models import Cliente
from inventario.models import Producto, Stock, MovimientoStock
from django.utils import timezone
from caja.models import MovimientoCaja


class Venta(models.Model):

    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('cobrada', 'Cobrada'),
    ]

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

    estado_pago = models.CharField(
        max_length=20,
        choices=ESTADOS_PAGO,
        default='pendiente'
    )

    fecha_cobro = models.DateTimeField(
        blank=True,
        null=True
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

        if self.estado_pago == 'cobrada' and not self.fecha_cobro:
            self.fecha_cobro = timezone.now()

        estado_anterior = None

        if self.pk:
            estado_anterior = Venta.objects.get(pk=self.pk).estado_pago

        super().save(*args, **kwargs)

        if estado_anterior != 'cobrada' and self.estado_pago == 'cobrada':
            MovimientoCaja.objects.create(
                tipo_movimiento='ingreso',
                motivo='venta',
                descripcion=f"Cobro de {self.numero_comprobante}",
                monto=self.total,
                usuario=self.usuario
            )

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

        if self.producto.tipo_producto == 'interno':
            raise ValidationError(
                'Este producto es de uso interno y no puede venderse.'
            )

        stock_disponible = self.producto.stock.cantidad_disponible

        if self.pk:
            detalle_anterior = DetalleVenta.objects.get(pk=self.pk)

            if detalle_anterior.producto == self.producto:
                stock_disponible += detalle_anterior.cantidad

        if self.cantidad > stock_disponible:
            raise ValidationError(
                'No hay stock suficiente para realizar la venta.'
            )

    def save(self, *args, **kwargs):

        es_nuevo = self.pk is None
        detalle_anterior = None

        if not es_nuevo:
            detalle_anterior = DetalleVenta.objects.get(pk=self.pk)

        self.clean()

        self.precio_unitario = self.producto.precio_venta

        self.subtotal = (
            self.cantidad *
            self.precio_unitario
        )

        super().save(*args, **kwargs)

        if es_nuevo:

            MovimientoStock.objects.create(
                producto=self.producto,
                tipo_movimiento='salida',
                motivo='venta',
                cantidad=self.cantidad
            )

        else:

            if detalle_anterior.producto == self.producto:

                diferencia = self.cantidad - detalle_anterior.cantidad

                if diferencia > 0:
                    MovimientoStock.objects.create(
                        producto=self.producto,
                        tipo_movimiento='salida',
                        motivo='venta',
                        cantidad=diferencia
                    )

                elif diferencia < 0:
                    MovimientoStock.objects.create(
                        producto=self.producto,
                        tipo_movimiento='entrada',
                        motivo='venta',
                        cantidad=abs(diferencia)
                    )

            else:

                MovimientoStock.objects.create(
                    producto=detalle_anterior.producto,
                    tipo_movimiento='entrada',
                    motivo='venta',
                    cantidad=detalle_anterior.cantidad
                )

                MovimientoStock.objects.create(
                    producto=self.producto,
                    tipo_movimiento='salida',
                    motivo='venta',
                    cantidad=self.cantidad
                )

        total_venta = sum(
            detalle.subtotal
            for detalle in self.venta.detalles.all()
        )

        self.venta.total = total_venta
        self.venta.save()

    def delete(self, *args, **kwargs):

        venta = self.venta
        producto = self.producto
        cantidad = self.cantidad

        super().delete(*args, **kwargs)

        MovimientoStock.objects.create(
            producto=producto,
            tipo_movimiento='entrada',
            motivo='venta',
            cantidad=cantidad
        )

        total_venta = sum(
            detalle.subtotal
            for detalle in venta.detalles.all()
        )

        venta.total = total_venta
        venta.save()
        
    def __str__(self):
        return (
            f"{self.producto.descripcion}"
            f" x {self.cantidad}"
        )
