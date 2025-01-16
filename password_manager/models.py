from django.db import models
import uuid

class UserKey(models.Model):
    """用户密钥模型"""
    key = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)

class Platform(models.Model):
    """平台信息模型"""
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PasswordEntry(models.Model):
    """密码条目模型"""
    user_key = models.ForeignKey(UserKey, on_delete=models.CASCADE, related_name='passwords')
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)  # 将存储加密后的密码
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_key', 'platform', 'username')

    def __str__(self):
        return f"{self.platform.name} - {self.username}"
