import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Paper
} from '@mui/material';
import { Pets, Star, TrendingUp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredPuppies, setFeaturedPuppies] = useState([]);
  const [latestNews, setLatestNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured puppies
        const puppiesResponse = await axios.get('/api/puppies?limit=3');
        setFeaturedPuppies(puppiesResponse.data);

        // Fetch latest news
        const newsResponse = await axios.get('/api/news?limit=3');
        setLatestNews(newsResponse.data.news);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/orig.webp)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.3)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography component="h1" variant="h2" color="inherit" gutterBottom>
            Добро пожаловать в питомник Zelenas
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Специализируемся на разведении пуделей. Найдите своего идеального друга среди наших прекрасных щенков
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/puppies"
              sx={{ mr: 2, mb: 2 }}
            >
              Посмотреть щенков
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/news"
              sx={{ mb: 2 }}
            >
              Читать новости
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Почему выбирают нас?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box textAlign="center">
                <Pets sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Здоровые щенки
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Все наши щенки проходят ветеринарный осмотр и имеют необходимые документы
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box textAlign="center">
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Поддержка после покупки
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Консультируем по уходу и воспитанию щенка после покупки
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Featured Puppies */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Популярные щенки
          </Typography>
          <Grid container spacing={4}>
            {featuredPuppies.map((puppy) => (
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
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/puppies"
            >
              Посмотреть всех щенков
            </Button>
          </Box>
        </Box>

        {/* Latest News */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Последние новости
          </Typography>
          <Grid container spacing={4}>
            {latestNews.map((news) => (
              <Grid item xs={12} md={4} key={news._id}>
                <Card 
                  component={Link} 
                  to={`/news/${news._id}`}
                  sx={{ 
                    height: '100%', 
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    }
                  }}
                >
                  {news.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={news.image}
                      alt={news.title}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {news.content.substring(0, 100)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      {new Date(news.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/news"
            >
              Читать все новости
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Footer/About Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 6,
          mt: 6,
          borderTop: 1,
          borderColor: 'grey.300'
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 3
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h5" gutterBottom color="primary">
                О питомнике Zelenas
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                Специализируемся на разведении здоровых и красивых пуделей. 
                Мы заботимся о каждом щенке и обеспечиваем поддержку нашим клиентам.
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h6" gutterBottom color="primary">
                Разработчик сайта
              </Typography>
              <Typography variant="body1" gutterBottom>
                А. А. Зеленин
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Telegram: @dog_29
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'grey.300', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Питомник Zelenas.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 