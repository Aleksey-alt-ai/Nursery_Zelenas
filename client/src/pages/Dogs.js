import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box
} from '@mui/material';

function Dogs() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dogs')
      .then(res => res.json())
      .then(data => {
        setDogs(data);
        setLoading(false);
      })
      .catch(err => {
        setDogs([]);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <Container>
      <Typography>Загрузка...</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Наши собаки
        </Typography>
        <Grid container spacing={4}>
          {dogs.map((dog) => (
            <Grid item xs={12} sm={6} md={4} key={dog.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {dog.photo && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`/${dog.photo.replace('\\', '/')}`}
                    alt={dog.name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    {dog.name}
                  </Typography>
                  {dog.achievements && (
                    <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                      <b>Достижения:</b> {dog.achievements}
                    </Typography>
                  )}
                  {dog.description && (
                    <Typography variant="body2" align="center">
                      {dog.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {dogs.length === 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Пока нет информации о собаках.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Dogs; 