from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import UserKey, Platform, PasswordEntry
from .serializers import UserKeySerializer, PlatformSerializer, PasswordEntrySerializer
from cryptography.fernet import Fernet
import base64
import json

class PasswordManagerViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # 临时设置，生产环境需要更改

    def create_key(self, request):
        """创建新的用户密钥"""
        user_key = UserKey.objects.create()
        serializer = UserKeySerializer(user_key)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def import_passwords(self, request):
        """导入密码"""
        key = request.data.get('key')
        passwords = request.data.get('passwords', [])
        
        try:
            user_key = UserKey.objects.get(key=key)
        except UserKey.DoesNotExist:
            return Response({'error': '无效的密钥'}, status=status.HTTP_400_BAD_REQUEST)

        created_entries = []
        for entry in passwords:
            platform_name = entry.get('platform')
            username = entry.get('username')
            password = entry.get('password')

            if not all([platform_name, username, password]):
                continue

            platform, _ = Platform.objects.get_or_create(name=platform_name)
            
            password_entry = PasswordEntry.objects.create(
                user_key=user_key,
                platform=platform,
                username=username,
                password=password  # 实际应用中需要加密
            )
            created_entries.append(PasswordEntrySerializer(password_entry).data)

        return Response(created_entries, status=status.HTTP_201_CREATED)

    def query_passwords(self, request):
        """查询密码"""
        key = request.query_params.get('key')
        platform_name = request.query_params.get('platform')

        try:
            user_key = UserKey.objects.get(key=key)
        except UserKey.DoesNotExist:
            return Response({'error': '无效的密钥'}, status=status.HTTP_400_BAD_REQUEST)

        queryset = PasswordEntry.objects.filter(user_key=user_key)
        if platform_name:
            queryset = queryset.filter(platform__name__icontains=platform_name)

        serializer = PasswordEntrySerializer(queryset, many=True)
        return Response(serializer.data)

    def update_password(self, request, pk=None):
        """更新密码"""
        key = request.data.get('key')
        new_password = request.data.get('password')

        try:
            user_key = UserKey.objects.get(key=key)
            password_entry = PasswordEntry.objects.get(pk=pk, user_key=user_key)
        except (UserKey.DoesNotExist, PasswordEntry.DoesNotExist):
            return Response({'error': '无效的密钥或密码条目'}, status=status.HTTP_400_BAD_REQUEST)

        password_entry.password = new_password  # 实际应用中需要加密
        password_entry.save()
        
        return Response(PasswordEntrySerializer(password_entry).data)

    def delete_password(self, request, pk=None):
        """删除密码"""
        key = request.query_params.get('key')

        try:
            user_key = UserKey.objects.get(key=key)
            password_entry = PasswordEntry.objects.get(pk=pk, user_key=user_key)
        except (UserKey.DoesNotExist, PasswordEntry.DoesNotExist):
            return Response({'error': '无效的密钥或密码条目'}, status=status.HTTP_400_BAD_REQUEST)

        password_entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
