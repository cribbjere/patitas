from django.db import models
from django.contrib.auth.models import User
from mascotas.models import Mascota


class Consulta(models.Model):

    fecha_consulta = models.DateField()

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

    def __str__(self):
        return f"Consulta de {self.mascota.nombre} - {self.fecha_consulta}"


class Vacunacion(models.Model):

    vacuna = models.CharField(max_length=100)

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

    def __str__(self):
        return f"{self.vacuna} - {self.mascota.nombre}"


class Cirugia(models.Model):

    ESTADOS = [
        ('programada', 'Programada'),
        ('realizada', 'Realizada'),
        ('cancelada', 'Cancelada'),
    ]

    fecha = models.DateField()

    tipo_cirugia = models.CharField(max_length=100)

    diagnostico_previo = models.TextField(
        blank=True,
        null=True
    )

    procedimiento = models.TextField()

    observaciones = models.TextField(
        blank=True,
        null=True
    )

    costo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
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

class ServicioHigiene(models.Model):

    TIPOS_SERVICIO = [
        ('baño', 'Baño'),
        ('peluqueria', 'Peluquería'),
        ('baño_y_corte', 'Baño y corte'),
        ('corte_uñas', 'Corte de uñas'),
        ('limpieza_oidos', 'Limpieza de oídos'),
        ('baño_antipulgas', 'Baño antipulgas'),
    ]

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('realizado', 'Realizado'),
        ('cancelado', 'Cancelado'),
    ]

    fecha = models.DateField()

    tipo_servicio = models.CharField(
        max_length=50,
        choices=TIPOS_SERVICIO
    )

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
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

    def __str__(self):
        return f"{self.tipo_servicio} - {self.mascota.nombre}"