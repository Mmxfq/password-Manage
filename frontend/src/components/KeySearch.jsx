import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import * as api from '../services/api';

const KeySearch = () => {
  const [key, setKey] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async () => {
    try {
      const response = await api.queryPasswords(key);
      setPlatforms(response);
      setError('');
    } catch (err) {
      setError('查询失败，请检查密钥是否正确');
      setPlatforms([]);
    }
  };

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        查询已保存的密码
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="输入密钥"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ minWidth: '120px' }}
        >
          查询
        </Button>
      </Box>

      {platforms.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom>
            选择要查看的平台：
          </Typography>
          <List>
            {platforms.map((platform) => (
              <ListItem
                key={platform.id}
                button
                onClick={() => handlePlatformClick(platform)}
                sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}
              >
                <ListItemText primary={platform.platform_name} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{selectedPlatform?.platform_name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            用户名: {selectedPlatform?.username}
            <br />
            密码: {selectedPlatform?.password}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeySearch; 