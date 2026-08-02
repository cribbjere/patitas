from rest_framework.permissions import BasePermission


PERMISOS_POR_ROL = {
    'administrador': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
        'higiene',
        'productos',
        'stock',
        'ventas',
        'caja',
        'reportes',
        'usuarios',
        'configuracion',
    },

    'recepcionista': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
        'caja',
    },

    'veterinario': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
    },

    'ventas': {
        'dashboard',
        'clientes',
        'productos',
        'stock',
        'ventas',
        'caja',
    },

    'higiene': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'higiene',
    },
}


class EsAdministrador(BasePermission):
    message = 'Solo un administrador puede realizar esta operación.'

    def has_permission(self, request, view):
        usuario = request.user

        if not usuario or not usuario.is_authenticated:
            return False

        if usuario.is_superuser:
            return True

        perfil = getattr(usuario, 'perfil', None)

        if not perfil:
            return False

        return (
            perfil.rol == 'administrador'
            and perfil.estado == 'activo'
            and usuario.is_active
        )


class TienePermisoModulo(BasePermission):
    message = 'No tenés permiso para acceder a este módulo.'

    def has_permission(self, request, view):
        usuario = request.user

        if not usuario or not usuario.is_authenticated:
            return False

        if not usuario.is_active:
            return False

        if usuario.is_superuser:
            return True

        perfil = getattr(usuario, 'perfil', None)

        if not perfil or perfil.estado != 'activo':
            return False

        modulo = getattr(view, 'modulo_permiso', None)

        if not modulo:
            return False

        rol = str(perfil.rol).strip().lower()
        modulo = str(modulo).strip().lower()

        permisos = PERMISOS_POR_ROL.get(rol, set())

        return modulo in permisos