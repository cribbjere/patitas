from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)

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
        'consumo_insumos',
        'proveedores',
        'compras',
        'ventas',
        'pagos',
        'caja',
        'reportes',
        'usuarios',
        'configuracion',
        'servicios',
    },

    'recepcionista': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'higiene',
        'ventas',
        'pagos',
        'caja',
        'servicios',
    },

    'veterinario': {
        'dashboard',
        'clientes',
        'mascotas',
        'turnos',
        'consultas',
        'vacunaciones',
        'cirugias',
        'consumo_insumos',
        'reportes',
        'servicios',
    },

    'ventas': {
        'dashboard',
        'clientes',
        'productos',
        'stock',
        'proveedores',
        'compras',
        'ventas',
        'pagos',
        'caja',
        'reportes',
        'servicios',
    },

    'higiene': {
        'dashboard',
        'mascotas',
        'turnos',
        'higiene',
        'consumo_insumos',
        'servicios',
    },
}


class EsAdministrador(BasePermission):
    message = (
        'Solo un administrador puede realizar '
        'esta operación.'
    )

    def has_permission(self, request, view):
        usuario = request.user

        if (
            not usuario
            or not usuario.is_authenticated
        ):
            return False

        if usuario.is_superuser:
            return True

        perfil = getattr(
            usuario,
            'perfil',
            None,
        )

        if not perfil:
            return False

        return (
            usuario.is_active
            and perfil.estado == 'activo'
            and perfil.rol == 'administrador'
        )


class TienePermisoModulo(BasePermission):
    message = (
        'No tenés permiso para acceder '
        'a este módulo.'
    )

    def has_permission(self, request, view):
        usuario = request.user

        if (
            not usuario
            or not usuario.is_authenticated
        ):
            return False

        if not usuario.is_active:
            return False

        if usuario.is_superuser:
            return True

        perfil = getattr(
            usuario,
            'perfil',
            None,
        )

        if (
            not perfil
            or perfil.estado != 'activo'
        ):
            return False

        modulo = getattr(
            view,
            'modulo_permiso',
            None,
        )

        if not modulo:
            return False

        rol_normalizado = str(
            perfil.rol
        ).strip().lower()

        modulo_normalizado = str(
            modulo
        ).strip().lower()

        permisos = PERMISOS_POR_ROL.get(
            rol_normalizado,
            set(),
        )

        if modulo_normalizado not in permisos:
            return False

        roles_permitidos_config = getattr(
            view,
            'roles_permitidos',
            None,
        )

        if roles_permitidos_config:
            roles_permitidos = {
                str(rol).strip().lower()
                for rol in roles_permitidos_config
            }

            if rol_normalizado not in roles_permitidos:
                self.message = (
                    'Tu rol no tiene permiso para '
                    'realizar esta operación.'
                )
                return False

        roles_solo_lectura = {
            str(rol).strip().lower()
            for rol in getattr(
                view,
                'roles_solo_lectura',
                set(),
            )
        }
        # Los roles indicados en la vista podrán realizar
        # únicamente consultas GET, HEAD y OPTIONS.
        roles_solo_lectura = {
            str(rol).strip().lower()
            for rol in getattr(
                view,
                'roles_solo_lectura',
                set(),
            )
        }

        if (
            rol_normalizado in roles_solo_lectura
            and request.method not in SAFE_METHODS
        ):
            self.message = (
                'Tu rol solamente puede consultar '
                'la información de este módulo.'
            )
            return False

        return True