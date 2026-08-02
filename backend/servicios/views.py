from rest_framework import viewsets

from usuarios.permisos import TienePermisoModulo

from .models import Servicio
from .serializers import ServicioSerializer


class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all().order_by(
        'categoria',
        'descripcion',
    )

    serializer_class = ServicioSerializer
    permission_classes = [TienePermisoModulo]
    modulo_permiso = 'servicios'

    roles_solo_lectura = {
        'recepcionista',
        'veterinario',
        'ventas',
        'higiene',
    }