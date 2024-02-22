import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, StyleSheet, Modal, TextInput, Button, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // pour l'icone delete

export default function GalleryScreen({ route }) {
  const { photos } = route.params;
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [photoDescriptions, setPhotoDescriptions] = useState({});
  const [photoLocations, setPhotoLocations] = useState({});

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const savedDescriptions = await AsyncStorage.getItem('photoDescriptions');
        if (savedDescriptions !== null) {
          setPhotoDescriptions(JSON.parse(savedDescriptions));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des descriptions:', error);
      }
    };

    //Charger les photos déjà enregistré //Probleme -- Le fait de ne pas avoir d'apk empêche la sauvegarde ?
    const fetchLocations = async () => {
      try {
        const savedLocations = await AsyncStorage.getItem('photoLocations');
        if (savedLocations !== null) {
          setPhotoLocations(JSON.parse(savedLocations));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
      }
    };

    fetchDescriptions();
    fetchLocations();
  }, []);

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleDelete = (photo) => {
    // Supprime la photo
    const updatedDescriptions = { ...photoDescriptions };
    const updatedLocations = { ...photoLocations };

    delete updatedDescriptions[photo];
    delete updatedLocations[photo];

    setPhotoDescriptions(updatedDescriptions);
    setPhotoLocations(updatedLocations);

    // Update
    AsyncStorage.setItem('photoDescriptions', JSON.stringify(updatedDescriptions));
    AsyncStorage.setItem('photoLocations', JSON.stringify(updatedLocations));
  };

  const handleSave = () => {
    // Enregistre la photo
    setPhotoDescriptions({ ...photoDescriptions, [selectedPhoto]: description });
    setPhotoLocations({ ...photoLocations, [selectedPhoto]: location });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePhotoPress(item)}>
            <View style={styles.photoContainer}>
              <Image source={{ uri: item }} style={styles.photo} />
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.photoText}>{photoDescriptions[item] ? photoDescriptions[item] : ''}</Text>
                <Text style={styles.photoLocation}>{photoLocations[item] ? photoLocations[item] : ''}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Lieu"
              onChangeText={text => setLocation(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={text => setDescription(text)}
            />
            <Button title="Enregistrer" onPress={handleSave} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    marginRight: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  textContainer: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
  },
  photoLocation: {
    fontSize: 12,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    minWidth: 300,
  },
  input: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
  },
});

