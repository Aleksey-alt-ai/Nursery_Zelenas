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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Puppies = () => {
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    breed: '',
    gender: ''
  });

  useEffect(() => {
    fetchPuppies();
  }, []);

  const fetchPuppies = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.breed) params.append('breed', filters.breed);
      if (filters.gender) params.append('gender', filters.gender);

      const response = await axios.get(`/api/puppies?${params}`);
      setPuppies(response.data);
    } catch (error) {
      console.error('Error fetching puppies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPuppies();
  };

  const clearFilters = () => {
    setFilters({
      breed: '',
      gender: ''
    });
    fetchPuppies();
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Щенки на продажу
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Фильтры
          </Typography>
          <Box component="form" onSubmit={handleFilterSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Размер пуделя</InputLabel>
                  <Select
                    value={filters.breed}
                    label="Размер пуделя"
                    onChange={(e) => handleFilterChange('breed', e.target.value)}
                  >
                    <MenuItem value="">Все размеры</MenuItem>
                    <MenuItem value="той">Той-пудель</MenuItem>
                    <MenuItem value="миниатюрный">Миниатюрный пудель</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Пол</InputLabel>
                  <Select
                    value={filters.gender}
                    label="Пол"
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="male">Мальчик</MenuItem>
                    <MenuItem value="female">Девочка</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">
                Применить фильтры
              </Button>
              <Button variant="outlined" onClick={clearFilters}>
                Сбросить
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Puppies Grid */}
        <Grid container spacing={4}>
          {puppies.map((puppy) => (
            <Grid item xs={12} sm={6} md={4} key={puppy._id}>
              <Card 
                component={Link} 
                to={`/puppies/${puppy._id}`}
                sx={{ 
                  height: '100%', 
                  textDecoration: 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={puppy.images[0] || 'https://via.placeholder.com/300x200?text=Щенок'}
                  alt={puppy.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {puppy.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {puppy.breed} • {puppy.age} мес.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {puppy.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {puppy.price.toLocaleString()} ₽
                    </Typography>
                    <Chip 
                      label={puppy.gender === 'male' ? 'Мальчик' : 'Девочка'} 
                      size="small" 
                      color="secondary" 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {puppies.length === 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Щенки не найдены
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Puppies; 