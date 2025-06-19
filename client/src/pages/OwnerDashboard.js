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
  const [dogs, setDogs] = useState([]);
  const [openDogDialog, setOpenDogDialog] = useState(false);
  const [dogForm, setDogForm] = useState({ name: '', achievements: '', description: '' });
  const [dogImage, setDogImage] = useState(null);
  const [editingDog, setEditingDog] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDogs();
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

  const fetchDogs = async () => {
    try {
      const res = await axios.get('/api/dogs');
      setDogs(res.data);
    } catch (error) {
      console.error('Error fetching dogs:', error);
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

  const handleOpenDogDialog = (dog = null) => {
    if (dog) {
      setEditingDog(dog);
      setDogForm({
        name: dog.name || '',
        achievements: dog.achievements || '',
        description: dog.description || '',
      });
      setDogImage(null);
    } else {
      setEditingDog(null);
      setDogForm({ name: '', achievements: '', description: '' });
      setDogImage(null);
    }
    setOpenDogDialog(true);
  };

  const handleCloseDogDialog = () => {
    setOpenDogDialog(false);
    setEditingDog(null);
    setDogForm({ name: '', achievements: '', description: '' });
    setDogImage(null);
  };

  const handleDogImageChange = (e) => {
    setDogImage(e.target.files[0]);
  };

  const handleDogFormChange = (e) => {
    setDogForm({ ...dogForm, [e.target.name]: e.target.value });
  };

  const handleDogSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', dogForm.name);
      formData.append('achievements', dogForm.achievements);
      formData.append('description', dogForm.description);
      if (dogImage) formData.append('photo', dogImage);
      if (editingDog) {
        await axios.put(`/api/dogs/${editingDog.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/dogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      handleCloseDogDialog();
      fetchDogs();
    } catch (error) {
      console.error('Error saving dog:', error);
    }
  };

  const handleDeleteDog = async (id) => {
    if (window.confirm('Удалить собаку?')) {
      try {
        await axios.delete(`/api/dogs/${id}`);
        fetchDogs();
      } catch (error) {
        console.error('Error deleting dog:', error);
      }
    }
  };

  const handleTogglePuppyStatus = async (puppy) => {
    try {
      await axios.put(`/api/puppies/${puppy._id}`, { is_available: !puppy.isAvailable });
      fetchData();
    } catch (error) {
      console.error('Ошибка при смене статуса щенка:', error);
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
                      label={puppy.isAvailable ? 'На продаже' : 'Продано'} 
                      color={puppy.isAvailable ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1, mr: 1 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      color={puppy.isAvailable ? 'warning' : 'success'}
                      onClick={() => handleTogglePuppyStatus(puppy)}
                      sx={{ mt: 1 }}
                    >
                      {puppy.isAvailable ? 'Отметить как продано' : 'Вернуть на продажу'}
                    </Button>
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

          {/* Dogs Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6"><Pets sx={{ mr: 1 }} /> Наши собаки</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDogDialog()}>Добавить собаку</Button>
              </Box>
              <Grid container spacing={2}>
                {dogs.map((dog) => (
                  <Grid item xs={12} sm={6} md={4} key={dog.id}>
                    <Card>
                      {dog.photo && (
                        <img src={`/${dog.photo.replace('\\', '/')}`} alt={dog.name} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                      )}
                      <CardContent>
                        <Typography variant="h6">{dog.name}</Typography>
                        {dog.achievements && <Typography variant="body2"><b>Достижения:</b> {dog.achievements}</Typography>}
                        {dog.description && <Typography variant="body2">{dog.description}</Typography>}
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => handleOpenDogDialog(dog)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDeleteDog(dog.id)}><Delete /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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

        {/* Dog Dialog */}
        <Dialog open={openDogDialog} onClose={handleCloseDogDialog}>
          <DialogTitle>{editingDog ? 'Редактировать собаку' : 'Добавить собаку'}</DialogTitle>
          <form onSubmit={handleDogSubmit} encType="multipart/form-data">
            <DialogContent>
              <TextField
                margin="dense"
                label="Имя"
                name="name"
                value={dogForm.name}
                onChange={handleDogFormChange}
                fullWidth
                required
              />
              <TextField
                margin="dense"
                label="Достижения"
                name="achievements"
                value={dogForm.achievements}
                onChange={handleDogFormChange}
                fullWidth
                multiline
              />
              <TextField
                margin="dense"
                label="Описание"
                name="description"
                value={dogForm.description}
                onChange={handleDogFormChange}
                fullWidth
                multiline
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 2 }}
              >
                {editingDog ? 'Заменить фото' : 'Загрузить фото'}
                <input type="file" hidden accept="image/*" onChange={handleDogImageChange} />
              </Button>
              {editingDog && editingDog.photo && (
                <Box mt={2}><img src={`/${editingDog.photo.replace('\\', '/')}`} alt="dog" style={{ maxWidth: 150 }} /></Box>
              )}
              {dogImage && (
                <Box mt={2}><img src={URL.createObjectURL(dogImage)} alt="preview" style={{ maxWidth: 150 }} /></Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDogDialog}>Отмена</Button>
              <Button type="submit" variant="contained">Сохранить</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OwnerDashboard; 