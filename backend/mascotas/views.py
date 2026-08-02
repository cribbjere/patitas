from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import Especie, Mascota
from .serializers import (
    EspecieSerializer,
    MascotaSerializer,
)


class EspecieViewSet(viewsets.ModelViewSet):
    queryset = Especie.objects.all().order_by('nombre')
    serializer_class = EspecieSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'mascotas'

    roles_solo_lectura = {
        'veterinario',
        'higiene',
    }


class MascotaViewSet(viewsets.ModelViewSet):
    queryset = (
        Mascota.objects
        .select_related(
            'cliente',
            'especie',
        )
        .all()
        .order_by('nombre')
    )

    serializer_class = MascotaSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'mascotas'

    roles_solo_lectura = {
        'veterinario',
        'higiene',
    }