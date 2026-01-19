from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail

from .models import Order
from .serializers import OrderSerializer


class OrderCreateView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        order = serializer.save()

        # Determinar correo destino
        if order.user:
            to_email = order.user.email
        else:
            to_email = order.guest_email

        if to_email:
            send_mail(
                subject="Confirmación de pedido - Café Chonta",
                message=f"Tu pedido #{order.id} fue registrado con éxito.",
                from_email=None,
                recipient_list=[to_email],
                fail_silently=True
            )


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")
