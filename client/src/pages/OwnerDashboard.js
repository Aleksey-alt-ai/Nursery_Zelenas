import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Pets, Article, PhotoCamera, Close } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [puppies, setPuppies] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPuppyDialog, setOpenPuppyDialog] = useState(false);
  const [openNewsDialog, setOpenNewsDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    breed: '',
    age: '',
    price: '',
    description: '',
    gender: '',
    color: '',
    weight: '',
    vaccinations: false,
    documents: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [puppiesRes, newsRes] = await Promise.all([
        axios.get('/api/puppies/owner/my'),
        axios.get('/api/news/owner/my')
      ]);
      setPuppies(puppiesRes.data);
      setNews(newsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type, item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        breed: item.breed || '',
        age: item.age || '',
        price: item.price || '',
        description: item.description || '',
        gender: item.gender || '',
        color: item.color || '',
        weight: item.weight || '',
        vaccinations: item.vaccinations || false,
        documents: item.documents || false
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        breed: '',
        age: '',
        price: '',
        description: '',
        gender: '',
        color: '',
        weight: '',
        vaccinations: false,
        documents: false
      });
    }
    
    if (type === 'puppy') {
      setOpenPuppyDialog(true);
    } else {
      setOpenNewsDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenPuppyDialog(false);
    setOpenNewsDialog(false);
    setEditingItem(null);
    setSelectedImages([]);
    setImagePreview([]);
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
    
    // Создаем превью для изображений
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update existing item
        if (openPuppyDialog) {
          await axios.put(`/api/puppies/${editingItem._id}`, formData);
        } else {
          await axios.put(`/api/news/${editingItem._id}`, formData);
        }
      } else {
        // Create new item
        if (openPuppyDialog) {
          // Создаем FormData для отправки изображений
          const formDataToSend = new FormData();
          
          // Добавляем данные формы
          Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
          });
          
          // Добавляем изображения
          selectedImages.forEach((image, index) => {
            formDataToSend.append('images', image);
          });
          
          await axios.post('/api/puppies', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          await axios.post('/api/news', formData);
        }
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      try {
        if (type === 'puppy') {
          await axios.delete(`/api/puppies/${id}`);
        } else {
          await axios.delete(`/api/news/${id}`);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
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
          Панель управления
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Добро пожаловать, {user?.name}! Здесь вы можете управлять объявлениями о щенках и новостями питомника.
        </Alert>

        <Grid container spacing={4}>
          {/* Puppies Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Pets sx={{ mr: 1 }} />
                  Щенки ({puppies.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('puppy')}
                >
                  Добавить щенка
                </Button>
              </Box>
              
              {puppies.map((puppy) => (
                <Card key={puppy._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{puppy.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {puppy.breed} • {puppy.age} мес. • {puppy.price.toLocaleString()} ₽
                    </Typography>
                    <Chip 
                      label={puppy.isAvailable ? 'Доступен' : 'Продано'} 
                      color={puppy.isAvailable ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleOpenDialog('puppy', puppy)}>
                      <Edit sx={{ mr: 0.5 }} />
                      Редактировать
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete('puppy', puppy._id)}>
                      <Delete sx={{ mr: 0.5 }} />
                      Удалить
                    </Button>
                  </CardActions>
                </Card>
              ))}
              
              {puppies.length === 0 && (
                <Typography color="text.secondary" align="center">
                  Нет объявлений о щенках
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* News Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Article sx={{ mr: 1 }} />
                  Новости ({news.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog('news')}
                >
                  Добавить новость
                </Button>
              </Box>
              
              {news.map((item) => (
                <Card key={item._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                    <Chip 
                      label={item.isPublished ? 'Опубликовано' : 'Черновик'} 
                      color={item.isPublished ? 'success' : 'warning'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleOpenDialog('news', item)}>
                      <Edit sx={{ mr: 0.5 }} />
                      Редактировать
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDelete('news', item._id)}>
                      <Delete sx={{ mr: 0.5 }} />
                      Удалить
                    </Button>
                  </CardActions>
                </Card>
              ))}
              
              {news.length === 0 && (
                <Typography color="text.secondary" align="center">
                  Нет новостей
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Puppy Dialog */}
        <Dialog open={openPuppyDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingItem ? 'Редактировать щенка' : 'Добавить щенка'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Название"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Размер пуделя</InputLabel>
                    <Select
                      value={formData.breed}
                      label="Размер пуделя"
                      onChange={(e) => setFormData({...formData, breed: e.target.value})}
                      required
                    >
                      <MenuItem value="той">Той-пудель</MenuItem>
                      <MenuItem value="миниатюрный">Миниатюрный пудель</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Возраст (месяцев)"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Цена (₽)"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Пол</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Пол"
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <MenuItem value="male">Мальчик</MenuItem>
                      <MenuItem value="female">Девочка</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Цвет"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Описание"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </Grid>
                
                {/* Поле для загрузки изображений */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Фотографии щенка
                    </Typography>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="image-upload"
                      multiple
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCamera />}
                        sx={{ mb: 2 }}
                      >
                        Выбрать фотографии
                      </Button>
                    </label>
                    
                    {/* Превью изображений */}
                    {imagePreview.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {imagePreview.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }
                              }}
                              onClick={() => removeImage(index)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingItem ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* News Dialog */}
        <Dialog open={openNewsDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingItem ? 'Редактировать новость' : 'Добавить новость'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Заголовок"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Содержание"
                    multiline
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingItem ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OwnerDashboard; 