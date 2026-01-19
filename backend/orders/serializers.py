from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source="product"
    )

    class Meta:
        model = OrderItem
        fields = ["product_id", "quantity"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    guest_email = serializers.EmailField(required=False, allow_null=True)

    class Meta:
        model = Order
        fields = ["id", "created_at", "guest_email", "items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request = self.context.get("request")

        # Usuario logeado (JWT)
        if request and request.user.is_authenticated:
            order = Order.objects.create(
                user=request.user,
                **validated_data
            )
        else:
            # Invitado
            if not validated_data.get("guest_email"):
                raise serializers.ValidationError(
                    {"guest_email": "El correo es obligatorio para pedidos como invitado"}
                )
            order = Order.objects.create(**validated_data)

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order