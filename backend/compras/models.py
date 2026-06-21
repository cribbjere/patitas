from django.db import models
from django.contrib.auth.models import User
from inventario.models import Producto, MovimientoStock

class Proveedor(models.Model):

    nombre = models.CharField(
        max_length=100
    )

    telefono = models.CharField(
        max_length=30,
        blank=True,
        null=True
    )

    email = models.EmailField(
        blank=True,
        null=True
    )

    direccion = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    activo = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.nombre

class Compra(models.Model):

    fecha = models.DateField()

    numero_comprobante = models.CharField(
    max_length=20,
    unique=True,
    blank=True,
    null=True
)

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    numero_factura = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name='compras'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='compras_registradas',
        blank=True,
        null=True
    )
    
    def save(self, *args, **kwargs):

        if not self.numero_comprobante:

            ultima_compra = Compra.objects.order_by('id').last()

            if ultima_compra and ultima_compra.numero_comprobante:
                ultimo_numero = int(
                    ultima_compra.numero_comprobante.replace('COMP-', '')
                )
            else:
                ultimo_numero = 0

            nuevo_numero = ultimo_numero + 1

            self.numero_comprobante = f"COMP-{nuevo_numero:06d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Compra #{self.id} - {self.proveedor.nombre}"

class CompraDetalle(models.Model):

    compra = models.ForeignKey(
        Compra,
        on_delete=models.CASCADE,
        related_name='detalles'
    )

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='compras'
    )

    cantidad = models.IntegerField()

    costo_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    def save(self, *args, **kwargs):

        es_nuevo = self.pk is None

        self.subtotal = self.cantidad * self.costo_unitario

        super().save(*args, **kwargs)

        if es_nuevo:
            MovimientoStock.objects.create(
                producto=self.producto,
                tipo_movimiento='entrada',
                motivo='compra',
                cantidad=self.cantidad
            )

        total_compra = sum(
            detalle.subtotal
            for detalle in self.compra.detalles.all()
        )

        self.compra.total = total_compra
        self.compra.save()

    def __str__(self):
        return (
            f"{self.producto.descripcion}"
            f" x {self.cantidad}"
        )