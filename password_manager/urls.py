from django.urls import path
from .views import PasswordManagerViewSet

urlpatterns = [
    path('create-key/', PasswordManagerViewSet.as_view({'post': 'create_key'})),
    path('import-passwords/', PasswordManagerViewSet.as_view({'post': 'import_passwords'})),
    path('query-passwords/', PasswordManagerViewSet.as_view({'get': 'query_passwords'})),
    path('update-password/<int:pk>/', PasswordManagerViewSet.as_view({'put': 'update_password'})),
    path('delete-password/<int:pk>/', PasswordManagerViewSet.as_view({'delete': 'delete_password'})),
] 