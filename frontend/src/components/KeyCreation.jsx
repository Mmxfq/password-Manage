import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Snackbar,
  Paper,
  Divider,
} from '@mui/material';
import PasswordForm from './PasswordForm';
import PasswordList from './PasswordList';
import * as api from '../services/api';

const KeyCreation = () => {
  const [newKey, setNewKey] = useState('');
  const [existingKey, setExistingKey] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateKey = async () => {
    try {
      const response = await api.createKey();
      setNewKey(response.key);
      setActiveKey(response.key);
      setExistingKey('');
      setPasswords([]);
      setSuccess('密钥创建成功！请妥善保管此密钥。');
    } catch (err) {
      setError('创建密钥失败');
    }
  };

  const handleUseExistingKey = async () => {
    if (!existingKey) {
      setError('请输入密钥');
      return;
    }
    try {
      const response = await api.queryPasswords(existingKey);
      setPasswords(response);
      setActiveKey(existingKey);
      setNewKey('');
      setSuccess('密钥验证成功！');
    } catch (err) {
      setError('密钥验证失败，请检查密钥是否正确');
    }
  };

  const handleImportPassword = async (passwordData) => {
    if (!activeKey) {
      setError('请先创建或输入密钥');
      return;
    }
    try {
      await api.importPasswords(activeKey, [passwordData]);
      const response = await api.queryPasswords(activeKey);
      setPasswords(response);
      setSuccess('密码添加成功！');
    } catch (err) {
      setError('添加密码失败');
    }
  };

  const handleUpdatePassword = async (id, newPassword) => {
    try {
      await api.updatePassword(activeKey, id, newPassword);
      const response = await api.queryPasswords(activeKey);
      setPasswords(response);
      setSuccess('密码更新成功！');
    } catch (err) {
      setError('更新密码失败');
    }
  };

  const handleDeletePassword = async (id) => {
    try {
      await api.deletePassword(activeKey, id);
      const response = await api.queryPasswords(activeKey);
      setPasswords(response);
      setSuccess('密码删除成功！');
    } catch (err) {
      setError('删除密码失败');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          创建新密钥
        </Typography>
        <TextField
          fullWidth
          label="新生成的密钥"
          value={newKey}
          InputProps={{
            readOnly: true,
          }}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateKey}
          sx={{ mt: 2 }}
          fullWidth
        >
          生成新密钥
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          使用现有密钥
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="输入已有密钥"
            value={existingKey}
            onChange={(e) => setExistingKey(e.target.value)}
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseExistingKey}
            sx={{ mt: 2, minWidth: '120px' }}
          >
            使用密钥
          </Button>
        </Box>
      </Paper>

      {activeKey && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            添加新密码
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            当前使用的密钥: {activeKey}
          </Typography>
          <PasswordForm onSubmit={handleImportPassword} />
          <Divider sx={{ my: 3 }} />
          <PasswordList
            passwords={passwords}
            onDelete={handleDeletePassword}
            onUpdate={handleUpdatePassword}
          />
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default KeyCreation; 