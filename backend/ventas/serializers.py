from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import DetalleVenta, Venta


def convertir_error_django(error):
    """Convierte ValidationError de Django en un formato legible para DRF."""
    if hasattr(error, 'message_dict'):
        return error.message_dict

    if hasattr(error, 'messages'):
        return error.messages

    return str(error)


class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_descripcion = serializers.CharField(
        source='producto.descripcion',
        read_only=True,
    )
    lote_numero = serializers.CharField(
        source='lote.numero_lote',
        read_only=True,
    )
    fecha_vencimiento = serializers.DateField(
        source='lote.fecha_vencimiento',
        read_only=True,
    )
    stock_disponible = serializers.IntegerField(
        source='lote.cantidad_disponible',
        read_only=True,
    )

    class Meta:
        model = DetalleVenta
        fields = [
            'id',
            'venta',
            'producto',
            'producto_descripcion',
            'lote',
            'lote_numero',
            'fecha_vencimiento',
            'stock_disponible',
            'cantidad',
            'precio_unitario',
            'subtotal',
            'autorizacion_veterinaria',
            'stock_descontado',
        ]
        read_only_fields = [
            'id',
            'precio_unitario',
            'subtotal',
            'stock_descontado',
        ]
        extra_kwargs = {
            # En una venta anidada, VentaSerializer asigna la venta.
            'venta': {'required': False},
        }

    def validate(self, attrs):
        producto = attrs.get(
            'producto',
            getattr(self.instance, 'producto', None),
        )
        lote = attrs.get(
            'lote',
            getattr(self.instance, 'lote', None),
        )
        cantidad = attrs.get(
            'cantidad',
            getattr(self.instance, 'cantidad', None),
        )
        autorizacion = attrs.get(
            'autorizacion_veterinaria',
            getattr(self.instance, 'autorizacion_veterinaria', False),
        )

        if producto is None:
            raise serializers.ValidationError({
                'producto': 'Seleccioná un producto.'
            })

        if lote is None:
            raise serializers.ValidationError({
                'lote': 'Seleccioná un lote.'
            })

        if lote.producto_id != producto.id:
            raise serializers.ValidationError({
                'lote': 'El lote seleccionado no pertenece al producto.'
            })

        if cantidad is None or cantidad <= 0:
            raise serializers.ValidationError({
                'cantidad': 'La cantidad debe ser mayor que cero.'
            })

        if producto.estado != 'activo':
            raise serializers.ValidationError({
                'producto': 'Este producto está inactivo y no puede venderse.'
            })

        if producto.tipo_producto == 'interno':
            raise serializers.ValidationError({
                'producto': 'Este producto es de uso interno y no puede venderse.'
            })

        if (
            lote.fecha_vencimiento
            and lote.fecha_vencimiento < timezone.localdate()
        ):
            raise serializers.ValidationError({
                'lote': 'No se puede vender un lote vencido.'
            })

        categoria = (producto.categoria or '').strip().lower()

        if categoria in {'medicamento', 'vacuna'} and not autorizacion:
            raise serializers.ValidationError({
                'autorizacion_veterinaria': (
                    'Este producto requiere autorización veterinaria o receta.'
                )
            })

        stock_disponible = lote.cantidad_disponible

        if (
            self.instance
            and self.instance.stock_descontado
            and self.instance.lote_id == lote.id
        ):
            stock_disponible += self.instance.cantidad

        if cantidad > stock_disponible:
            raise serializers.ValidationError({
                'cantidad': (
                    f'No hay stock suficiente en el lote. '
                    f'Disponible: {stock_disponible}.'
                )
            })

        return attrs

    def create(self, validated_data):
        if not validated_data.get('venta'):
            raise serializers.ValidationError({
                'venta': 'La venta es obligatoria.'
            })

        try:
            return DetalleVenta.objects.create(**validated_data)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                convertir_error_django(error)
            ) from error

    def update(self, instance, validated_data):
        try:
            return super().update(instance, validated_data)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                convertir_error_django(error)
            ) from error


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True)
    cliente_nombre = serializers.SerializerMethodField()
    usuario_nombre = serializers.CharField(
        source='usuario.username',
        read_only=True,
    )

    class Meta:
        model = Venta
        fields = [
            'id',
            'numero_comprobante',
            'fecha',
            'cliente',
            'cliente_nombre',
            'consumidor_final',
            'observaciones',
            'total',
            'metodo_pago',
            'estado',
            'estado_pago',
            'fecha_cobro',
            'usuario',
            'usuario_nombre',
            'detalles',
        ]
        read_only_fields = [
            'id',
            'numero_comprobante',
            'total',
            'fecha_cobro',
            'usuario',
        ]

    def get_cliente_nombre(self, obj):
        if obj.consumidor_final or not obj.cliente:
            return 'Consumidor final'

        nombre = getattr(obj.cliente, 'nombre', '') or ''
        apellido = getattr(obj.cliente, 'apellido', '') or ''

        return f'{nombre} {apellido}'.strip() or str(obj.cliente)

    def validate(self, attrs):
        cliente = attrs.get(
            'cliente',
            getattr(self.instance, 'cliente', None),
        )
        consumidor_final = attrs.get(
            'consumidor_final',
            getattr(self.instance, 'consumidor_final', False),
        )

        if consumidor_final and cliente:
            raise serializers.ValidationError({
                'cliente': (
                    'Una venta a consumidor final no debe tener cliente asociado.'
                )
            })

        if not consumidor_final and not cliente:
            raise serializers.ValidationError({
                'cliente': (
                    'Seleccioná un cliente o marcá consumidor final.'
                )
            })

        detalles = attrs.get('detalles')

        if self.instance is None and not detalles:
            raise serializers.ValidationError({
                'detalles': 'Agregá al menos un producto a la venta.'
            })

        if detalles:
            lotes_usados = set()

            for detalle in detalles:
                lote = detalle.get('lote')

                if lote and lote.id in lotes_usados:
                    raise serializers.ValidationError({
                        'detalles': (
                            'No repitas el mismo lote. '
                            'Unificá la cantidad en un solo producto.'
                        )
                    })

                if lote:
                    lotes_usados.add(lote.id)

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({
                'usuario': 'No se pudo identificar al usuario autenticado.'
            })

        validated_data['usuario'] = request.user

        try:
            venta = Venta.objects.create(**validated_data)

            for detalle_data in detalles_data:
                detalle_data.pop('venta', None)

                DetalleVenta.objects.create(
                    venta=venta,
                    **detalle_data,
                )

            venta.refresh_from_db()
            return venta

        except DjangoValidationError as error:
            raise serializers.ValidationError(
                convertir_error_django(error)
            ) from error

    @transaction.atomic
    def update(self, instance, validated_data):
        detalles_data = validated_data.pop('detalles', None)

        if detalles_data is not None:
            raise serializers.ValidationError({
                'detalles': (
                    'Los productos de una venta no se modifican desde esta acción. '
                    'Cancelá la venta y registrá una nueva.'
                )
            })

        try:
            for campo, valor in validated_data.items():
                setattr(instance, campo, valor)

            instance.save()
            instance.refresh_from_db()
            return instance

        except DjangoValidationError as error:
            raise serializers.ValidationError(
                convertir_error_django(error)
            ) from error