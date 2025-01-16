import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const PasswordList = ({ passwords, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState({});

  const handleEdit = (id, currentPassword) => {
    setEditingId(id);
    setNewPassword(currentPassword);
  };

  const handleUpdate = () => {
    onUpdate(editingId, newPassword);
    setEditingId(null);
    setNewPassword('');
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        已保存的密码
      </Typography>
      <List>
        {passwords.map((entry) => (
          <ListItem
            key={entry.id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEdit(entry.id, entry.password)}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(entry.id)}
                >
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={entry.platform_name}
              secondary={
                <>
                  用户名: {entry.username}
                  <br />
                  密码:{' '}
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility(entry.id)}
                  >
                    {showPassword[entry.id] ? entry.password : '********'}
                  </span>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={editingId !== null} onClose={() => setEditingId(null)}>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="新密码"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingId(null)}>取消</Button>
          <Button onClick={handleUpdate} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasswordList; 