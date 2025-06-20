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
    name: '',
    breed: '',
    age: '',
    price: '',
    description: '',
    gender: '',
    color: '',
    weight: '',
    vaccinations: false,
    documents: false,
    title: '',
    content: '',
    size: '',
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [openDogDialog, setOpenDogDialog] = useState(false);
  const [dogForm, setDogForm] = useState({ name: '', achievements: '', description: '' });
  const [dogImage, setDogImage] = useState(null);
  const [editingDog, setEditingDog] = useState(null);
  const [newsImage, setNewsImage] = useState(null);
  const [newsError, setNewsError] = useState('');

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

          {/* Puppies Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6"><Pets sx={{ mr: 1 }} /> Щенки на продажу</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingItem(null); setFormData({ ...formData, name: '', breed: '', age: '', price: '', description: '', gender: '', color: '', weight: '', vaccinations: false, documents: false }); setSelectedImages([]); setImagePreview([]); setOpenPuppyDialog(true); }}>Добавить щенка</Button>
              </Box>
              <Grid container spacing={2}>
                {puppies.map((puppy) => {
                  const images = Array.isArray(puppy.images)
                    ? puppy.images
                    : (typeof puppy.images === 'string' ? JSON.parse(puppy.images || '[]') : []);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={puppy.id}>
                      <Card>
                        {images.length > 0 && (
                          <img src={images[0]} alt={puppy.name} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                        )}
                        <CardContent>
                          <Typography variant="h6">{puppy.name}</Typography>
                          <Typography variant="body2">Рост: {puppy.size}</Typography>
                          <Typography variant="body2">Возраст: {puppy.age}</Typography>
                          <Typography variant="body2">Цена: {puppy.price} ₽</Typography>
                          <Typography variant="body2">{puppy.description}</Typography>
                        </CardContent>
                        <CardActions>
                          <IconButton onClick={() => { setEditingItem(puppy); setFormData({ ...formData, ...puppy }); setSelectedImages([]); setImagePreview(images); setOpenPuppyDialog(true); }}><Edit /></IconButton>
                          <IconButton onClick={async () => { if(window.confirm('Удалить щенка?')) { await axios.delete(`/api/puppies/${puppy.id}`); fetchData(); } }}><Delete /></IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* News Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6"><Article sx={{ mr: 1 }} /> Новости питомника</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingItem(null); setFormData({ ...formData, title: '', content: '' }); setNewsImage(null); setOpenNewsDialog(true); }}>Добавить новость</Button>
              </Box>
              <Grid container spacing={2}>
                {news.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      {item.image && (
                        <img src={`/${item.image.replace('\\', '/')}`} alt={item.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
                      )}
                      <CardContent>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2">{item.content}</Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => { setEditingItem(item); setFormData({ ...formData, ...item }); setNewsImage(null); setOpenNewsDialog(true); }}><Edit /></IconButton>
                        <IconButton onClick={async () => { if(window.confirm('Удалить новость?')) { await axios.delete(`/api/news/${item.id}`); fetchData(); } }}><Delete /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

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

        {/* Puppy Dialog */}
        <Dialog open={openPuppyDialog} onClose={() => setOpenPuppyDialog(false)}>
          <DialogTitle>{editingItem ? 'Редактировать щенка' : 'Добавить щенка'}</DialogTitle>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData();
            data.append('name', formData.name);
            data.append('size', formData.size);
            data.append('age', formData.age);
            data.append('price', formData.price);
            data.append('description', formData.description);
            data.append('gender', formData.gender);
            data.append('color', formData.color);
            data.append('vaccinations', formData.vaccinations);
            data.append('documents', formData.documents);
            selectedImages.forEach((img) => data.append('images', img));
            try {
              const config = { headers: { 'Content-Type': 'multipart/form-data' } };
              const token = localStorage.getItem('token');
              if (token) config.headers['Authorization'] = `Bearer ${token}`;
              if (editingItem) {
                await axios.put(`/api/puppies/${editingItem.id}`, data, config);
              } else {
                await axios.post('/api/puppies', data, config);
              }
              setOpenPuppyDialog(false);
              fetchData();
            } catch (err) {
              let msg = 'Ошибка при сохранении';
              if (err.response && err.response.data && err.response.data.message) {
                msg += `: ${err.response.data.message}`;
                if (err.response.data.errors) {
                  msg += '\n' + err.response.data.errors.map(e => e.msg).join('\n');
                }
              }
              alert(msg);
            }
          }} encType="multipart/form-data">
            <DialogContent>
              <TextField margin="dense" label="Имя" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} fullWidth required />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Рост</InputLabel>
                <Select value={formData.size || ''} label="Рост" onChange={e => setFormData({ ...formData, size: e.target.value })} required>
                  <MenuItem value="Той">Той</MenuItem>
                  <MenuItem value="Миниатюр">Миниатюр</MenuItem>
                </Select>
              </FormControl>
              <TextField margin="dense" label="Возраст" name="age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} fullWidth />
              <TextField margin="dense" label="Цена" name="price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} fullWidth />
              <TextField margin="dense" label="Описание" name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} fullWidth multiline />
              <TextField margin="dense" label="Окрас" name="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} fullWidth />
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                  Загрузить фото
                  <input type="file" hidden multiple accept="image/*" onChange={e => { setSelectedImages(Array.from(e.target.files)); setImagePreview(Array.from(e.target.files).map(file => URL.createObjectURL(file))); }} />
                </Button>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {imagePreview.map((img, idx) => <img key={idx} src={img} alt="preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8 }} />)}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPuppyDialog(false)}>Отмена</Button>
              <Button type="submit" variant="contained">Сохранить</Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* News Dialog */}
        <Dialog open={openNewsDialog} onClose={() => setOpenNewsDialog(false)}>
          <DialogTitle>{editingItem ? 'Редактировать новость' : 'Добавить новость'}</DialogTitle>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            if (newsImage) data.append('image', newsImage);
            try {
              if (editingItem) {
                await axios.put(`/api/news/${editingItem.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
              } else {
                await axios.post('/api/news', data, { headers: { 'Content-Type': 'multipart/form-data' } });
              }
              setOpenNewsDialog(false);
              fetchData();
            } catch (err) {
              let msg = 'Ошибка при сохранении';
              if (err.response && err.response.data && err.response.data.message) {
                msg += `: ${err.response.data.message}`;
                if (err.response.data.errors) {
                  msg += '\n' + err.response.data.errors.map(e => e.msg).join('\n');
                }
              }
              alert(msg);
            }
          }} encType="multipart/form-data">
            <DialogContent>
              <TextField margin="dense" label="Заголовок" name="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} fullWidth required />
              <TextField margin="dense" label="Текст новости" name="content" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} fullWidth multiline />
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" component="label" startIcon={<PhotoCamera />}>
                  Загрузить фото
                  <input type="file" hidden accept="image/*" onChange={e => setNewsImage(e.target.files[0])} />
                </Button>
                {newsImage && <Box mt={2}><img src={URL.createObjectURL(newsImage)} alt="preview" style={{ maxWidth: 150 }} /></Box>}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenNewsDialog(false)}>Отмена</Button>
              <Button type="submit" variant="contained">Сохранить</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OwnerDashboard; 