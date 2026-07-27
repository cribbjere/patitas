# Generated manually after resetting the development database.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("clientes", "0001_initial"),
        (
            "mascotas",
            "0002_mascota_alergias_mascota_grupo_sanguineo_and_more",
        ),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Turno",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("fecha", models.DateField()),
                ("hora", models.TimeField()),
                ("hora_fin", models.TimeField()),
                (
                    "motivo_consulta",
                    models.CharField(max_length=150),
                ),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("pendiente", "Programado"),
                            ("realizado", "Realizado"),
                            ("cancelado", "Cancelado"),
                            ("ausente", "Ausente"),
                        ],
                        default="pendiente",
                        max_length=20,
                    ),
                ),
                (
                    "observaciones",
                    models.TextField(
                        blank=True,
                        null=True,
                    ),
                ),
                (
                    "cliente",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="turnos",
                        to="clientes.cliente",
                    ),
                ),
                (
                    "mascota",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="turnos",
                        to="mascotas.mascota",
                    ),
                ),
                (
                    "usuario",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="turnos_registrados",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]