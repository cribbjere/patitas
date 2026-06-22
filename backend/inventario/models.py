from django.db import models
from django.db.models.signals import post_save
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
        ('ambos', 'Comercial e Interno')
    ]

    ESTADOS = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    descripcion = models.CharField(
        max_length=100
    )

    categoria = models.CharField(
        max_length=30,
        choices=CATEGORIAS
    )

    tipo_producto = models.CharField(
        max_length=20,
        choices=TIPOS_PRODUCTO
    )

    precio_compra_referencia = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )  

    precio_venta = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    stock_minimo = models.IntegerField(
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='activo'
    )

    def __str__(self):
        return self.descripcion

class Stock(models.Model):

    producto = models.OneToOneField(
        Producto,
        on_delete=models.CASCADE,
        related_name='stock'
    )

    cantidad_disponible = models.IntegerField(
        default=0
    )

    ultima_actualizacion = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.producto.descripcion} - {self.cantidad_disponible}"

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
        related_name='movimientos'
    )

    tipo_movimiento = models.CharField(
        max_length=20,
        choices=TIPOS_MOVIMIENTO
    )

    motivo = models.CharField(
        max_length=30,
        choices=MOTIVOS
    )

    cantidad = models.IntegerField()

    fecha_movimiento = models.DateTimeField(
        auto_now_add=True
    )

    def clean(self):

        if self.tipo_movimiento == 'salida':

            stock_actual = self.producto.stock.cantidad_disponible

            if self.cantidad > stock_actual:

                from django.core.exceptions import ValidationError

                raise ValidationError(
                    'No hay stock suficiente para realizar esta salida.'
                )

    def __str__(self):
        return (
            f"{self.tipo_movimiento} - "
            f"{self.producto.descripcion}"
        )
    
@receiver(post_save, sender=Producto)
def crear_stock_automatico(sender, instance, created, **kwargs):

    if created:
        Stock.objects.create(
            producto=instance,
            cantidad_disponible=0
        )

@receiver(post_save, sender=MovimientoStock)
def actualizar_stock(sender, instance, created, **kwargs):

    if created:

        stock = instance.producto.stock

        if instance.tipo_movimiento == 'entrada':
            stock.cantidad_disponible += instance.cantidad

        elif instance.tipo_movimiento == 'salida':
            stock.cantidad_disponible -= instance.cantidad

        stock.save()