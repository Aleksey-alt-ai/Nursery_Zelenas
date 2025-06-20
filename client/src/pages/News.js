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
  Button
} from '@mui/material';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = () => {
    setLoading(true);
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.news)) {
          setNews(data.news);
        } else if (Array.isArray(data)) {
          setNews(data);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setNews([]);
        setLoading(false);
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить новость?')) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE' });
    fetchNews();
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
          Новости питомника
        </Typography>
        <Grid container spacing={4}>
          {news.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id || item._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {item.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image.startsWith('/') ? item.image : `/${item.image}`}
                    alt={item.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom align="center">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" paragraph>
                    {item.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') : ''}
                  </Typography>
                  <Button color="error" variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => handleDelete(item.id || item._id)}>
                    Удалить
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {news.length === 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Пока нет новостей.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default News; 