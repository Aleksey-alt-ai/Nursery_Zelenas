import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`/api/news/${id}`);
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (!news) {
    return (
      <Container>
        <Typography>Новость не найдена</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {news.title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {new Date(news.createdAt).toLocaleDateString('ru-RU')} • Автор: {news.author?.name}
          </Typography>
          {news.tags && news.tags.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {news.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" sx={{ mr: 1 }} />
              ))}
            </Box>
          )}
        </Box>

        {news.image && (
          <Box sx={{ mb: 3 }}>
            <img 
              src={news.image} 
              alt={news.title}
              style={{ 
                width: '100%', 
                maxHeight: '400px', 
                objectFit: 'cover',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          {news.content}
        </Typography>
      </Box>
    </Container>
  );
};

export default NewsDetail; 