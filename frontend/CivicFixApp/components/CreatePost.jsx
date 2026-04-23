import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import styles from './FeedsStyles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const CreatePost = ({ user, onPostCreated, onCancel }) => {
  const [displayName, setDisplayName] = useState('CivicFix User');
  const [issueText, setIssueText] = useState('');
  const [location, setLocation] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user]);

  const handlePickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setImageError('Photo library access is needed to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });

    if (result.canceled) {
      return;
    }

    const pickedImages = result.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
    }));

    setSelectedImages((prevImages) => {
      const mergedImages = [...prevImages, ...pickedImages].filter(
        (image, index, allImages) => index === allImages.findIndex((entry) => entry.uri === image.uri)
      );

      if (mergedImages.length >= 1) {
        setImageError('');
      }

      return mergedImages.slice(0, 6);
    });
  };

  const handleRemoveImage = (uriToRemove) => {
    const nextImages = selectedImages.filter((image) => image.uri !== uriToRemove);
    setSelectedImages(nextImages);
    if (nextImages.length < 1) {
      setImageError('Please upload at least 1 image');
    }
  };

  const handlePostIssue = async () => {
    if (!issueText.trim()) {
      setInfoMessage('Please describe the issue before posting.');
      return;
    }

    if (selectedImages.length < 1) {
      setImageError('Please upload at least 1 image');
      return;
    }

    setIsSubmitting(true);
    setInfoMessage('');
    setImageError('');

    const trimmedIssue = issueText.trim();
    const trimmedLocation = location.trim();
    const newPost = {
      id: Date.now().toString(),
      author: displayName,
      handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`,
      time: 'Just now',
      brief: trimmedIssue,
      location: trimmedLocation || 'Location not specified',
      status: 'Reported',
      image: selectedImages[0].uri,
      images: selectedImages,
      upvotes: 0,
      downvotes: 0,
    };

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken && API_BASE_URL) {
        await fetch(`${API_BASE_URL}/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: trimmedIssue,
            location: trimmedLocation,
            status: 'Reported',
            images: selectedImages.map((image) => image.uri),
          }),
        });
      }
    } catch (error) {
      console.warn('Issue post failed:', error.message);
    } finally {
      setIsSubmitting(false);
    }

    onPostCreated(newPost);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.createPostTitle}>New Report</Text>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={handlePostIssue}
          disabled={isSubmitting}
        >
          <Text style={styles.postButtonText}>{isSubmitting ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.createPostContainer}
      >
        <ScrollView
          style={styles.createPostScroll}
          contentContainerStyle={styles.createPostScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.composerCard}>
          <View style={styles.composerHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.composerTitle}>
              <Text style={styles.composerLabel}>What civic issue did you notice?</Text>
              <Text style={styles.composerSubLabel}>
                Add a clear description so your neighborhood and city team can act faster.
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue you saw..."
            placeholderTextColor="#94A3B8"
            multiline
            value={issueText}
            onChangeText={setIssueText}
          />

          <TextInput
            style={styles.input}
            placeholder="Location (optional)"
            placeholderTextColor="#94A3B8"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.imageUploadSection}>
            <View style={styles.imageUploadHeader}>
              <Text style={styles.imageUploadTitle}>Photos</Text>
              <Text style={styles.imageUploadHelper}>Minimum 1 image required</Text>
            </View>

            <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickImages}>
              <Text style={styles.imagePickerButtonText}>
                {selectedImages.length ? 'Add More Images' : 'Upload Images'}
              </Text>
            </TouchableOpacity>

            {selectedImages.length ? (
              <View style={styles.imagePreviewGrid}>
                {selectedImages.map((image, index) => (
                  <View key={image.uri} style={styles.imagePreviewCard}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(image.uri)}
                    >
                      <Text style={styles.removeImageButtonText}>Remove</Text>
                    </TouchableOpacity>
                    <Text style={styles.imagePreviewLabel}>Image {index + 1}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {imageError ? <Text style={styles.imageErrorText}>{imageError}</Text> : null}
          </View>

          {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
