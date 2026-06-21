from django.db import models
from clientes.models import Cliente

class Especie(models.Model):

    nombre = models.CharField(
        max_length=50,
        unique=True
    )

    def __str__(self):
        return self.nombre
    
class Mascota(models.Model):

    SEXOS = [
        ('macho', 'Macho'),
        ('hembra', 'Hembra'),
    ]

    ESTADOS = [
        ('activo', 'Activo'),
        ('fallecido', 'Fallecido'),
    ]

    nombre = models.CharField(max_length=50)

    fecha_nacimiento = models.DateField(
        null=True,
        blank=True
    )

    raza = models.CharField(max_length=50)

    peso = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    sexo = models.CharField(
        max_length=10,
        choices=SEXOS
    )

    estado = models.CharField(
        max_length=15,
        choices=ESTADOS,
        default='activo'
    )

    alergias = models.TextField(
        blank=True,
        null=True
    )

    grupo_sanguineo = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    observaciones_generales = models.TextField(
        blank=True,
        null=True
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='mascotas'
    )

    especie = models.ForeignKey(
        Especie,
        on_delete=models.PROTECT,
        related_name='mascotas'
    )

    def __str__(self):
        return self.nombre