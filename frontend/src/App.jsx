import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import KeyCreation from './components/KeyCreation';
import KeySearch from './components/KeySearch';

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          密码管理平台
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="功能选择"
            centered
          >
            <Tab label="密钥管理" />
            <Tab label="快速查询" />
          </Tabs>
        </Box>

        {tabValue === 0 && <KeyCreation />}
        {tabValue === 1 && <KeySearch />}
      </Box>
    </Container>
  );
}

export default App; 