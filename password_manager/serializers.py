from rest_framework import serializers
from .models import UserKey, Platform, PasswordEntry

class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = ['id', 'name', 'description']

class PasswordEntrySerializer(serializers.ModelSerializer):
    platform_name = serializers.CharField(source='platform.name', read_only=True)
    
    class Meta:
        model = PasswordEntry
        fields = ['id', 'platform', 'platform_name', 'username', 'password', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class UserKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserKey
        fields = ['key', 'created_at', 'last_used']
        read_only_fields = ['key', 'created_at', 'last_used'] 