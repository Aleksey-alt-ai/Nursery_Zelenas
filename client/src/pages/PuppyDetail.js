import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { Pets, Phone, Email } from '@mui/icons-material';
import axios from 'axios';

const PuppyDetail = () => {
  const { id } = useParams();
  const [puppy, setPuppy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '+7',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    fetchPuppy();
  }, [id]);

  const fetchPuppy = async () => {
    try {
      const response = await axios.get(`/api/puppies/${id}`);
      setPuppy(response.data);
    } catch (error) {
      console.error('Error fetching puppy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('sending');

    try {
      // Здесь можно добавить отправку сообщения владельцу
      // Пока просто показываем успех
      setSubmitStatus('success');
      setContactForm({ name: '', phone: '+7', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  const handleContactChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (!puppy) {
    return (
      <Container>
        <Typography>Щенок не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="400"
                image={puppy.images[0] || 'https://via.placeholder.com/400x400?text=Щенок'}
                alt={puppy.title}
              />
            </Card>
          </Grid>

          {/* Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom>
              {puppy.title}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary" gutterBottom>
                {puppy.price.toLocaleString()} ₽
              </Typography>
              <Chip 
                label={puppy.gender === 'male' ? 'Мальчик' : 'Девочка'} 
                color="secondary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={puppy.breed} 
                variant="outlined" 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Характеристики:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Возраст: {puppy.age} мес.
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Цвет: {puppy.color || 'Не указан'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Вес: {puppy.weight ? `${puppy.weight} кг` : 'Не указан'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Вакцинация: {puppy.vaccinations ? 'Да' : 'Нет'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Документы: {puppy.documents ? 'Да' : 'Нет'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Описание:
            </Typography>
            <Typography variant="body1" paragraph>
              {puppy.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Контакты владельца:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1 }} />
                <Typography>{puppy.owner?.phone || 'Не указан'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Pets sx={{ mr: 1 }} />
                <Typography>{puppy.owner?.name || 'Не указан'}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Contact Form */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Написать владельцу
          </Typography>
          
          {submitStatus === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Сообщение отправлено! Владелец свяжется с вами в ближайшее время.
            </Alert>
          )}
          
          {submitStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка при отправке сообщения. Попробуйте еще раз.
            </Alert>
          )}

          <Box component="form" onSubmit={handleContactSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ваше имя"
                  value={contactForm.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Номер телефона"
                  value={contactForm.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  required
                  helperText="Формат: +7XXXXXXXXXX"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Сообщение"
                  multiline
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => handleContactChange('message', e.target.value)}
                  required
                  placeholder="Расскажите о себе и почему хотите купить этого щенка..."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitStatus === 'sending'}
              sx={{ mt: 2 }}
            >
              {submitStatus === 'sending' ? 'Отправка...' : 'Отправить сообщение'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PuppyDetail; 