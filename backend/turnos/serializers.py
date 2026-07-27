from rest_framework import serializers

from .models import Turno


class TurnoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Turno
        fields = "__all__"
        read_only_fields = ["usuario"]

    def validate(self, attrs):
        mascota = attrs.get(
            "mascota",
            getattr(self.instance, "mascota", None)
        )

        cliente = attrs.get(
            "cliente",
            getattr(self.instance, "cliente", None)
        )

        hora = attrs.get(
            "hora",
            getattr(self.instance, "hora", None)
        )

        hora_fin = attrs.get(
            "hora_fin",
            getattr(self.instance, "hora_fin", None)
        )

        if mascota and cliente:
            if mascota.cliente_id != cliente.id:
                raise serializers.ValidationError({
                    "mascota":
                        "La mascota seleccionada no pertenece al cliente indicado."
                })

        if hora and hora_fin and hora_fin <= hora:
            raise serializers.ValidationError({
                "hora_fin":
                    "La hora de finalización debe ser posterior a la hora de inicio."
            })

        return attrs