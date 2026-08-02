from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import Turno
from .serializers import TurnoSerializer


class TurnoViewSet(viewsets.ModelViewSet):
    queryset = (
        Turno.objects
        .select_related(
            'cliente',
            'mascota',
            'usuario',
        )
        .order_by(
            'fecha',
            'hora',
        )
    )

    serializer_class = TurnoSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'turnos'

    roles_solo_lectura = {
        'veterinario',
        'higiene',
    }

    def perform_create(self, serializer):
        serializer.save(
            usuario=self.request.user,
        )