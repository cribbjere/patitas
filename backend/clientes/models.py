from django.db import models


class Cliente(models.Model):

    ESTADOS = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    telefono = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    direccion = models.CharField(max_length=150)
    estado = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default='activo'
    )

    def __str__(self):
        return f"{self.nombre} {self.apellido}"