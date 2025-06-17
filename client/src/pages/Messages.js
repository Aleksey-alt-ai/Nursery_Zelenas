import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const Messages = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Сообщения
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Система сообщений
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будут отображаться ваши сообщения с владельцами питомника.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Messages; 