from rest_framework import viewsets

from .models import Turno
from .serializers import TurnoSerializer


class TurnoViewSet(viewsets.ModelViewSet):
    queryset = (
        Turno.objects
        .select_related(
            "cliente",
            "mascota",
            "usuario"
        )
        .order_by("fecha", "hora")
    )

    serializer_class = TurnoSerializer

    def perform_create(self, serializer):
        usuario = (
            self.request.user
            if self.request.user.is_authenticated
            else None
        )

        serializer.save(usuario=usuario)