import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Профиль
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Личный профиль
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь вы можете управлять своими данными и настройками.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 