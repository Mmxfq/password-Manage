import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const PasswordForm = ({ onSubmit }) => {
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ platform, username, password });
    setPlatform('');
    setUsername('');
    setPassword('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        添加新密码
      </Typography>
      <TextField
        fullWidth
        label="平台名称"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="用户名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="密码"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        required
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        fullWidth
      >
        保存
      </Button>
    </Box>
  );
};

export default PasswordForm; 