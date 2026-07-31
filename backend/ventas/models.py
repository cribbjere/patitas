from decimal import Decimal

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Sum
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils import timezone

from caja.models import MovimientoCaja
from clientes.models import Cliente
from inventario.models import LoteStock, MovimientoStock, Producto


class Venta(models.Model):

    ESTADOS_PAGO = [
        ('pendiente', 'Pendiente'),
        ('cobrada', 'Cobrada'),
    ]

    METODOS_PAGO = [
        ('efectivo', 'Efectivo'),
        ('debito', 'Débito'),
        ('credito', 'Crédito'),
        ('transferencia', 'Transferencia'),
    ]

    ESTADOS = [
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]

    fecha = models.DateField()

    numero_comprobante = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name='ventas',
        blank=True,
        null=True,
    )

    consumidor_final = models.BooleanField(default=False)

    observaciones = models.TextField(
        blank=True,
        null=True,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    metodo_pago = models.CharField(
        max_length=20,
        choices=METODOS_PAGO,
        default='efectivo',
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='completada',
    )

    estado_pago = models.CharField(
        max_length=20,
        choices=ESTADOS_PAGO,
        default='pendiente',
    )

    fecha_cobro = models.DateTimeField(
        blank=True,
        null=True,
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='ventas_registradas',
    )

    def clean(self):
        if not self.consumidor_final and not self.cliente_id:
            raise ValidationError(
                'Seleccioná un cliente o marcá consumidor final.'
            )

        if self.consumidor_final and self.cliente_id:
            raise ValidationError(
                'Una venta a consumidor final no debe tener un cliente asociado.'
            )

    def _generar_numero_comprobante(self):
        ultima_venta = (
            Venta.objects
            .exclude(numero_comprobante__isnull=True)
            .exclude(numero_comprobante='')
            .order_by('-id')
            .first()
        )

        ultimo_numero = 0

        if ultima_venta and ultima_venta.numero_comprobante:
            try:
                ultimo_numero = int(
                    ultima_venta.numero_comprobante.replace('VENT-', '')
                )
            except (TypeError, ValueError):
                ultimo_numero = ultima_venta.id or 0

        return f'VENT-{ultimo_numero + 1:06d}'

    def _registrar_movimiento_caja(self):
        if (
            self.estado != 'completada'
            or self.estado_pago != 'cobrada'
            or self.total <= 0
        ):
            return

        descripcion = f'Cobro de {self.numero_comprobante}'

        movimiento = MovimientoCaja.objects.filter(
            tipo_movimiento='ingreso',
            motivo='venta',
            descripcion=descripcion,
        ).first()

        if movimiento:
            movimiento.monto = self.total
            movimiento.usuario = self.usuario
            movimiento.save(update_fields=['monto', 'usuario'])
            return

        MovimientoCaja.objects.create(
            tipo_movimiento='ingreso',
            motivo='venta',
            descripcion=descripcion,
            monto=self.total,
            usuario=self.usuario,
        )

    @transaction.atomic
    def save(self, *args, **kwargs):
        estado_anterior = None

        if self.pk:
            estado_anterior = (
                Venta.objects
                .filter(pk=self.pk)
                .values_list('estado', flat=True)
                .first()
            )

        if not self.numero_comprobante:
            self.numero_comprobante = self._generar_numero_comprobante()

        if self.estado_pago == 'cobrada' and not self.fecha_cobro:
            self.fecha_cobro = timezone.now()

        if self.estado_pago == 'pendiente':
            self.fecha_cobro = None

        self.full_clean()
        super().save(*args, **kwargs)

        if estado_anterior == 'completada' and self.estado == 'cancelada':
            for detalle in self.detalles.select_for_update().all():
                detalle.restaurar_stock()

        elif estado_anterior == 'cancelada' and self.estado == 'completada':
            for detalle in self.detalles.select_for_update().all():
                detalle.descontar_stock()

        self._registrar_movimiento_caja()

    def recalcular_total(self):
        total = (
            self.detalles.aggregate(total=Sum('subtotal'))['total']
            or Decimal('0.00')
        )

        Venta.objects.filter(pk=self.pk).update(total=total)
        self.total = total
        self._registrar_movimiento_caja()

    def __str__(self):
        return self.numero_comprobante or f'Venta {self.pk}'


class DetalleVenta(models.Model):

    venta = models.ForeignKey(
        Venta,
        on_delete=models.CASCADE,
        related_name='detalles',
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='ventas',
    )

    lote = models.ForeignKey(
        LoteStock,
        on_delete=models.PROTECT,
        related_name='detalles_venta',
        blank=True,
        null=True,
    )

    cantidad = models.PositiveIntegerField()

    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    autorizacion_veterinaria = models.BooleanField(default=False)

    stock_descontado = models.BooleanField(
        default=False,
        editable=False,
    )

    def clean(self):
        if self.cantidad <= 0:
            raise ValidationError(
                'La cantidad debe ser mayor que cero.'
            )

        if self.producto.estado != 'activo':
            raise ValidationError(
                'Este producto está inactivo y no puede venderse.'
            )

        if self.producto.tipo_producto == 'interno':
            raise ValidationError(
                'Este producto es de uso interno y no puede venderse.'
            )

        if not self.lote_id:
            raise ValidationError(
                'Seleccioná el lote que se utilizará en la venta.'
            )

        if self.lote.producto_id != self.producto_id:
            raise ValidationError(
                'El lote seleccionado no pertenece al producto.'
            )

        if (
            self.lote.fecha_vencimiento
            and self.lote.fecha_vencimiento < timezone.localdate()
        ):
            raise ValidationError(
                'No se puede vender un lote vencido.'
            )

        if (
            (self.producto.categoria or '').lower()
            in {'medicamento', 'vacuna'}
            and not self.autorizacion_veterinaria
        ):
            raise ValidationError(
                'Este producto requiere autorización veterinaria o receta.'
            )

        if self.venta.estado == 'cancelada':
            return

        stock_disponible = self.lote.cantidad_disponible

        if self.pk:
            detalle_anterior = (
                DetalleVenta.objects
                .select_related('lote')
                .get(pk=self.pk)
            )

            if (
                detalle_anterior.stock_descontado
                and detalle_anterior.lote_id == self.lote_id
            ):
                stock_disponible += detalle_anterior.cantidad

        if self.cantidad > stock_disponible:
            raise ValidationError(
                'No hay stock suficiente en el lote seleccionado.'
            )

    def descontar_stock(self):
        if self.stock_descontado:
            return

        MovimientoStock.objects.create(
            producto=self.producto,
            lote=self.lote,
            tipo_movimiento='salida',
            motivo='venta',
            cantidad=self.cantidad,
        )

        DetalleVenta.objects.filter(pk=self.pk).update(
            stock_descontado=True
        )
        self.stock_descontado = True

    def restaurar_stock(self):
        if not self.stock_descontado:
            return

        MovimientoStock.objects.create(
            producto=self.producto,
            lote=self.lote,
            tipo_movimiento='entrada',
            motivo='venta',
            cantidad=self.cantidad,
        )

        DetalleVenta.objects.filter(pk=self.pk).update(
            stock_descontado=False
        )
        self.stock_descontado = False

    @transaction.atomic
    def save(self, *args, **kwargs):
        es_nuevo = self.pk is None
        detalle_anterior = None

        if not es_nuevo:
            detalle_anterior = (
                DetalleVenta.objects
                .select_related('producto', 'lote', 'venta')
                .select_for_update()
                .get(pk=self.pk)
            )

        self.precio_unitario = self.producto.precio_venta
        self.subtotal = self.cantidad * self.precio_unitario

        self.full_clean()
        super().save(*args, **kwargs)

        if self.venta.estado == 'cancelada':
            if detalle_anterior and detalle_anterior.stock_descontado:
                MovimientoStock.objects.create(
                    producto=detalle_anterior.producto,
                    lote=detalle_anterior.lote,
                    tipo_movimiento='entrada',
                    motivo='venta',
                    cantidad=detalle_anterior.cantidad,
                )

            DetalleVenta.objects.filter(pk=self.pk).update(
                stock_descontado=False
            )
            self.stock_descontado = False
            self.venta.recalcular_total()
            return

        if es_nuevo:
            self.descontar_stock()

        elif detalle_anterior.stock_descontado:
            mismo_lote = detalle_anterior.lote_id == self.lote_id

            if mismo_lote:
                diferencia = self.cantidad - detalle_anterior.cantidad

                if diferencia > 0:
                    MovimientoStock.objects.create(
                        producto=self.producto,
                        lote=self.lote,
                        tipo_movimiento='salida',
                        motivo='venta',
                        cantidad=diferencia,
                    )

                elif diferencia < 0:
                    MovimientoStock.objects.create(
                        producto=self.producto,
                        lote=self.lote,
                        tipo_movimiento='entrada',
                        motivo='venta',
                        cantidad=abs(diferencia),
                    )

                DetalleVenta.objects.filter(pk=self.pk).update(
                    stock_descontado=True
                )
                self.stock_descontado = True

            else:
                MovimientoStock.objects.create(
                    producto=detalle_anterior.producto,
                    lote=detalle_anterior.lote,
                    tipo_movimiento='entrada',
                    motivo='venta',
                    cantidad=detalle_anterior.cantidad,
                )

                MovimientoStock.objects.create(
                    producto=self.producto,
                    lote=self.lote,
                    tipo_movimiento='salida',
                    motivo='venta',
                    cantidad=self.cantidad,
                )

                DetalleVenta.objects.filter(pk=self.pk).update(
                    stock_descontado=True
                )
                self.stock_descontado = True

        else:
            self.descontar_stock()

        self.venta.recalcular_total()

    def __str__(self):
        return f'{self.producto.descripcion} x {self.cantidad}'


@receiver(pre_delete, sender=DetalleVenta)
def restaurar_stock_al_eliminar_detalle(sender, instance, **kwargs):
    if not instance.stock_descontado:
        return

    MovimientoStock.objects.create(
        producto=instance.producto,
        lote=instance.lote,
        tipo_movimiento='entrada',
        motivo='venta',
        cantidad=instance.cantidad,
    )