from django.db import models


class Servicio(models.Model):

    CATEGORIAS = [
        ('consulta', 'Consulta'),
        ('vacunacion', 'Vacunación'),
        ('cirugia', 'Cirugía'),
        ('higiene', 'Higiene'),
        ('estudio', 'Estudio'),
        ('otro', 'Otro'),
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

    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default='activo'
    )

    def __str__(self):
        return f"{self.descripcion} - ${self.precio}"