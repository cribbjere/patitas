from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Sum
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver


class Producto(models.Model):

    CATEGORIAS = [
        ('vacuna', 'Vacuna'),
        ('medicamento', 'Medicamento'),
        ('alimento', 'Alimento'),
        ('juguete', 'Juguete'),
        ('accesorio', 'Accesorio'),
        ('higiene', 'Higiene'),
        ('insumo_medico', 'Insumo médico'),
        ('antiparasitario', 'Antiparasitario'),
        ('otro', 'Otro'),
    ]

    TIPOS_PRODUCTO = [
        ('comercial', 'Comercial'),
        ('interno', 'Interno'),
        ('ambos', 'Comercial e Interno'),
    ]

    ESTADOS = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    descripcion = models.CharField(max_length=100)

    categoria = models.CharField(
        max_length=30,
        choices=CATEGORIAS,
    )

    tipo_producto = models.CharField(
        max_length=20,
        choices=TIPOS_PRODUCTO,
    )

    precio_compra_referencia = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    precio_venta = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    stock_minimo = models.IntegerField(default=0)

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='activo',
    )

    def __str__(self):
        return self.descripcion


class Stock(models.Model):

    producto = models.OneToOneField(
        Producto,
        on_delete=models.CASCADE,
        related_name='stock',
    )

    cantidad_disponible = models.IntegerField(default=0)

    ultima_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.producto.descripcion} - {self.cantidad_disponible}'


class LoteStock(models.Model):

    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='lotes',
    )

    numero_lote = models.CharField(max_length=100)

    cantidad_disponible = models.IntegerField(default=0)

    fecha_vencimiento = models.DateField(
        blank=True,
        null=True,
    )

    costo_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    fecha_ingreso = models.DateTimeField(auto_now_add=True)

    ultima_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['producto', 'numero_lote'],
                name='lote_unico_por_producto',
            )
        ]
        ordering = ['fecha_vencimiento', 'numero_lote']

    def clean(self):
        if self.cantidad_disponible < 0:
            raise ValidationError(
                'La cantidad disponible no puede ser negativa.'
            )

        if self.costo_unitario < 0:
            raise ValidationError(
                'El costo unitario no puede ser negativo.'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f'{self.producto.descripcion} - '
            f'Lote {self.numero_lote}'
        )


class MovimientoStock(models.Model):

    TIPOS_MOVIMIENTO = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    MOTIVOS = [
        ('compra', 'Compra'),
        ('venta', 'Venta'),
        ('vacunacion', 'Vacunación'),
        ('consulta', 'Consulta'),
        ('cirugia', 'Cirugía'),
        ('higiene', 'Higiene'),
        ('ajuste_manual', 'Ajuste manual'),
    ]

    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='movimientos',
    )

    lote = models.ForeignKey(
        LoteStock,
        on_delete=models.PROTECT,
        related_name='movimientos',
        blank=True,
        null=True,
    )

    tipo_movimiento = models.CharField(
        max_length=20,
        choices=TIPOS_MOVIMIENTO,
    )

    motivo = models.CharField(
        max_length=30,
        choices=MOTIVOS,
    )

    cantidad = models.IntegerField()

    fecha_movimiento = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.cantidad <= 0:
            raise ValidationError(
                'La cantidad del movimiento debe ser mayor que cero.'
            )

        if self.lote_id and self.lote.producto_id != self.producto_id:
            raise ValidationError(
                'El lote seleccionado no pertenece al producto.'
            )

        if self.tipo_movimiento != 'salida':
            return

        if self.lote_id:
            stock_actual = self.lote.cantidad_disponible
        else:
            stock, _ = Stock.objects.get_or_create(
                producto=self.producto,
            )
            stock_actual = stock.cantidad_disponible

        if self.cantidad > stock_actual:
            raise ValidationError(
                'No hay stock suficiente para realizar esta salida.'
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f'{self.tipo_movimiento} - '
            f'{self.producto.descripcion}'
        )


@receiver(post_save, sender=Producto)
def crear_stock_automatico(sender, instance, created, **kwargs):
    if created:
        Stock.objects.get_or_create(
            producto=instance,
            defaults={'cantidad_disponible': 0},
        )


@receiver(post_save, sender=LoteStock)
def actualizar_stock_desde_lotes(sender, instance, **kwargs):
    if not Producto.objects.filter(pk=instance.producto_id).exists():
        return

    cantidad_total = (
        LoteStock.objects
        .filter(producto_id=instance.producto_id)
        .aggregate(total=Sum('cantidad_disponible'))['total']
        or 0
    )

    Stock.objects.update_or_create(
        producto_id=instance.producto_id,
        defaults={'cantidad_disponible': cantidad_total},
    )


@receiver(post_delete, sender=LoteStock)
def actualizar_stock_al_eliminar_lote(sender, instance, **kwargs):
    if not Producto.objects.filter(pk=instance.producto_id).exists():
        return

    cantidad_total = (
        LoteStock.objects
        .filter(producto_id=instance.producto_id)
        .aggregate(total=Sum('cantidad_disponible'))['total']
        or 0
    )

    Stock.objects.update_or_create(
        producto_id=instance.producto_id,
        defaults={'cantidad_disponible': cantidad_total},
    )


@receiver(post_save, sender=MovimientoStock)
def actualizar_stock(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.lote_id:
        with transaction.atomic():
            lote = (
                LoteStock.objects
                .select_for_update()
                .get(pk=instance.lote_id)
            )

            if instance.tipo_movimiento == 'entrada':
                lote.cantidad_disponible += instance.cantidad
            else:
                if instance.cantidad > lote.cantidad_disponible:
                    raise ValidationError(
                        'No hay stock suficiente en el lote.'
                    )

                lote.cantidad_disponible -= instance.cantidad

            lote.save()

        return

    stock, _ = Stock.objects.get_or_create(
        producto=instance.producto,
    )

    if instance.tipo_movimiento == 'entrada':
        stock.cantidad_disponible += instance.cantidad
    else:
        if instance.cantidad > stock.cantidad_disponible:
            raise ValidationError(
                'No hay stock suficiente para realizar esta salida.'
            )

        stock.cantidad_disponible -= instance.cantidad

    stock.save()