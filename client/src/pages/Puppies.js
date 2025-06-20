import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  TextField,
  Button,
  MenuItem
} from '@mui/material';

function Puppies() {
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPuppies();
  }, []);

  const fetchPuppies = () => {
    setLoading(true);
    fetch('/api/puppies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPuppies(data);
        } else if (Array.isArray(data.puppies)) {
          setPuppies(data.puppies);
        } else {
          setPuppies([]);
        }
        setLoading(false);
      })
      .catch(err => {
        setPuppies([]);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить щенка?')) return;
    await fetch(`/api/puppies/${id}`, { method: 'DELETE' });
    fetchPuppies();
  };

  if (loading) return (
    <Container>
      <Typography>Загрузка...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Щенки на продажу
        </Typography>
        <Grid container spacing={4}>
          {puppies.map((puppy) => (
            <Grid item xs={12} sm={6} md={4} key={puppy.id || puppy._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {puppy.images && puppy.images[0] && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={puppy.images[0].startsWith('/') ? puppy.images[0] : `/${puppy.images[0]}`}
                    alt={puppy.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    {puppy.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                    {puppy.breed} • {puppy.age} мес.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" paragraph>
                    {puppy.description}
                  </Typography>
                  <Typography variant="h6" color="primary" align="center">
                    {puppy.price ? puppy.price.toLocaleString() : ''} ₽
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {puppy.gender === 'male' ? 'Мальчик' : puppy.gender === 'female' ? 'Девочка' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {puppy.color}
                  </Typography>
                  <Button color="error" variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => handleDelete(puppy.id || puppy._id)}>
                    Удалить
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {puppies.length === 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Пока нет информации о щенках.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Puppies; 