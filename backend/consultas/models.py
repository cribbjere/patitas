from django.db import models
from django.contrib.auth.models import User
from mascotas.models import Mascota
from servicios.models import Servicio
from caja.models import MovimientoCaja


class Consulta(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
    ]

    fecha_consulta = models.DateField()

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.PROTECT,
        related_name='consultas'
    )

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    diagnostico = models.TextField()
    tratamiento = models.TextField()
    observaciones = models.TextField(blank=True, null=True)

    peso_actual = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    temperatura = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        blank=True,
        null=True
    )

    proximo_control = models.DateField(
        blank=True,
        null=True
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name='consultas'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='consultas_registradas'
    )

    def save(self, *args, **kwargs):

        estado_anterior = None

        if self.pk:
            estado_anterior = Consulta.objects.get(pk=self.pk).estado

        self.precio = self.servicio.precio

        super().save(*args, **kwargs)

        if estado_anterior != 'realizada' and self.estado == 'realizada':

            MovimientoCaja.objects.create(
                tipo_movimiento='ingreso',
                motivo='servicio_clinico',
                descripcion=f"Consulta: {self.servicio.descripcion}",
                monto=self.precio,
                usuario=self.usuario
            )

    def __str__(self):
        return f"Consulta de {self.mascota.nombre} - {self.fecha_consulta}"


class Vacunacion(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aplicada', 'Aplicada'),
        ('cancelada', 'Cancelada'),
    ]

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.PROTECT,
        related_name='vacunaciones'
    )

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    fecha_aplicacion = models.DateField()

    proxima_dosis = models.DateField(
        blank=True,
        null=True
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name='vacunaciones'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='vacunaciones_registradas'
    )

    def save(self, *args, **kwargs):

        estado_anterior = None

        if self.pk:
            estado_anterior = Vacunacion.objects.get(pk=self.pk).estado

        self.precio = self.servicio.precio

        super().save(*args, **kwargs)

        if estado_anterior != 'aplicada' and self.estado == 'aplicada':

            MovimientoCaja.objects.create(
                tipo_movimiento='ingreso',
                motivo='servicio_clinico',
                descripcion=f"Vacunación: {self.servicio.descripcion}",
                monto=self.precio,
                usuario=self.usuario
            )

    def __str__(self):
        return f"{self.servicio.descripcion} - {self.mascota.nombre}"


class Cirugia(models.Model):

    ESTADOS = [
        ('programada', 'Programada'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
    ]

    fecha = models.DateField()

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.PROTECT,
        related_name='cirugias'
    )

    diagnostico_previo = models.TextField(
        blank=True,
        null=True
    )

    procedimiento = models.TextField()

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='programada'
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name='cirugias'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='cirugias_registradas'
    )

    def save(self, *args, **kwargs):

        estado_anterior = None

        if self.pk:
            estado_anterior = Cirugia.objects.get(pk=self.pk).estado

        self.precio = self.servicio.precio

        super().save(*args, **kwargs)

        if estado_anterior != 'realizada' and self.estado == 'realizada':

            MovimientoCaja.objects.create(
                tipo_movimiento='ingreso',
                motivo='servicio_clinico',
                descripcion=f"Cirugía: {self.servicio.descripcion}",
                monto=self.precio,
                usuario=self.usuario
            )

    def __str__(self):
        return f"{self.servicio.descripcion} - {self.mascota.nombre}"

class ServicioHigiene(models.Model):

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('realizado', 'Realizado'),
        ('cancelado', 'Cancelado'),
    ]

    fecha = models.DateField()

    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.PROTECT,
        related_name='servicios_higiene'
    )

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='pendiente'
    )

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    mascota = models.ForeignKey(
        Mascota,
        on_delete=models.CASCADE,
        related_name='servicios_higiene'
    )

    usuario = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='servicios_higiene_registrados'
    )

    def save(self, *args, **kwargs):

        estado_anterior = None

        if self.pk:
            estado_anterior = ServicioHigiene.objects.get(pk=self.pk).estado

        self.precio = self.servicio.precio

        super().save(*args, **kwargs)

        if estado_anterior != 'realizado' and self.estado == 'realizado':

            MovimientoCaja.objects.create(
                tipo_movimiento='ingreso',
                motivo='servicio_clinico',
                descripcion=f"Servicio de higiene: {self.servicio.descripcion}",
                monto=self.precio,
                usuario=self.usuario
            )

    def __str__(self):
        return f"{self.servicio.descripcion} - {self.mascota.nombre}"