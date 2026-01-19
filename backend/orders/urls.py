from django.urls import path
from .views import OrderCreateView, MyOrdersView

urlpatterns = [
    path("orders/", OrderCreateView.as_view()),
    path("my-orders/", MyOrdersView.as_view()),
]