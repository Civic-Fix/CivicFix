import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import styles from './FeedsStyles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
const MAX_IMAGES = 6;

const formatCoordinates = ({ lat, lng }) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Reported';

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    const geolocation = globalThis?.navigator?.geolocation;

    if (!geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

const reverseGeocode = async ({ lat, lng }) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding request failed');
  }

  const result = await response.json();
  return result.display_name || '';
};

const normalizeAssets = (assets = []) =>
  assets.map((asset) => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileName: asset.fileName || asset.uri.split('/').pop() || 'issue-proof.jpg',
  }));

const CreatePost = ({ user, onPostCreated, onCancel }) => {
  const [displayName, setDisplayName] = useState('CivicFix User');
  const [issueText, setIssueText] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  const [imageError, setImageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingReport, setIsPreparingReport] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [step, setStep] = useState('permissionGate');
  const [coordinates, setCoordinates] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [addressWarning, setAddressWarning] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user]);

  useEffect(() => {
    if (!coordinates) {
      return undefined;
    }

    let isActive = true;

    const loadAddress = async () => {
      setIsResolvingAddress(true);
      setAddressWarning('');

      try {
        const address = await reverseGeocode(coordinates);

        if (isActive) {
          setResolvedAddress(address);
        }
      } catch (error) {
        if (isActive) {
          setResolvedAddress('');
          setAddressWarning(
            'We could not resolve a readable address. Coordinates will still be attached.'
          );
        }
      } finally {
        if (isActive) {
          setIsResolvingAddress(false);
        }
      }
    };

    loadAddress();

    return () => {
      isActive = false;
    };
  }, [coordinates]);

  const mergeImages = (incomingAssets) => {
    const normalizedImages = normalizeAssets(incomingAssets);

    setSelectedImages((prevImages) => {
      const mergedImages = [...prevImages, ...normalizedImages].filter(
        (image, index, allImages) => index === allImages.findIndex((entry) => entry.uri === image.uri)
      );

      return mergedImages.slice(0, MAX_IMAGES);
    });

    setImageError('');
  };

  const requestLocationAccess = async ({ isRetry = false } = {}) => {
    if (isRetry) {
      setIsRefreshingLocation(true);
    }

    setLocationError('');

    try {
      const nextCoordinates = await getCurrentLocation();
      setCoordinates(nextCoordinates);
      return nextCoordinates;
    } catch (error) {
      setCoordinates(null);
      setResolvedAddress('');
      setLocationError('Location is required to report an issue');
      return null;
    } finally {
      if (isRetry) {
        setIsRefreshingLocation(false);
      }
    }
  };

  const handleContinueToReporting = async () => {
    setIsPreparingReport(true);
    setInfoMessage('');
    setImageError('');

    try {
      const [mediaPermission, cameraPermission] = await Promise.all([
        ImagePicker.requestMediaLibraryPermissionsAsync(),
        ImagePicker.requestCameraPermissionsAsync(),
      ]);

      const hasImageAccess = mediaPermission.granted || cameraPermission.granted;

      setMediaPermissionGranted(mediaPermission.granted);
      setCameraPermissionGranted(cameraPermission.granted);

      if (!hasImageAccess) {
        setImageError('Camera or photo library access is required to upload proof.');
      }

      const nextCoordinates = await requestLocationAccess();

      if (nextCoordinates && hasImageAccess) {
        setStep('compose');
      }
    } finally {
      setIsPreparingReport(false);
    }
  };

  const handlePickFromGallery = async () => {
    if (!mediaPermissionGranted) {
      setImageError('Photo library access is required to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_IMAGES,
    });

    if (result.canceled) {
      return;
    }

    mergeImages(result.assets);
  };

  const handleCapturePhoto = async () => {
    if (!cameraPermissionGranted) {
      setImageError('Camera access is required to capture proof.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    mergeImages(result.assets);
  };

  const handleRemoveImage = (uriToRemove) => {
    const nextImages = selectedImages.filter((image) => image.uri !== uriToRemove);
    setSelectedImages(nextImages);

    if (!nextImages.length) {
      setImageError('Please add at least 1 image to continue');
    }
  };

  const handleRefreshLocation = async () => {
    const nextCoordinates = await requestLocationAccess({ isRetry: true });

    if (nextCoordinates) {
      setStep('compose');
    }
  };

  const handlePostIssue = async () => {
    if (!issueText.trim()) {
      setInfoMessage('Please describe the issue before posting.');
      return;
    }

    if (!coordinates) {
      setLocationError('Location is required to report an issue');
      return;
    }

    if (!selectedImages.length) {
      setImageError('Please add at least 1 image to continue');
      return;
    }

    setIsSubmitting(true);
    setInfoMessage('');
    setLocationError('');
    setImageError('');

    const localPost = {
      id: Date.now().toString(),
      author: displayName,
      handle: `@${displayName.replace(/\s+/g, '').toLowerCase()}`,
      time: 'Just now',
      brief: issueText.trim(),
      location: resolvedAddress || formatCoordinates(coordinates),
      status: 'Reported',
      image: selectedImages[0]?.uri,
      images: selectedImages,
      upvotes: 0,
      downvotes: 0,
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      let syncedPost = localPost;

      if (authToken) {
        const response = await fetch(`${API_BASE_URL}/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: issueText.trim(),
            description: issueText.trim(),
            lat: coordinates.lat,
            lng: coordinates.lng,
            address: resolvedAddress || formatCoordinates(coordinates),
            status: 'reported',
            images: selectedImages.map((image) => image.uri),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Unable to create issue');
        }

        const createdIssue = result.issue;
        const primaryImage = createdIssue?.image_urls?.[0] || selectedImages[0]?.uri;
        const displayLocation =
          createdIssue?.address || resolvedAddress || formatCoordinates(coordinates);

        syncedPost = {
          ...localPost,
          id: createdIssue?.id || localPost.id,
          brief: createdIssue?.title || localPost.brief,
          location: displayLocation,
          status: formatStatus(createdIssue?.status),
          image: primaryImage,
          lat: createdIssue?.lat ?? localPost.lat,
          lng: createdIssue?.lng ?? localPost.lng,
        };
      } else {
        setInfoMessage('Posted locally. Log in again if you want it synced to the server.');
      }

      onPostCreated(syncedPost);
    } catch (error) {
      onPostCreated(localPost);
      setInfoMessage(
        error.message
          ? `${error.message}. Your report was added locally and can sync later.`
          : 'Your report was added locally and can sync later.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'permissionGate') {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.createPostTitle}>Report Issue</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.permissionGateCard}>
          <Text style={styles.permissionGateEyebrow}>Before you report</Text>
          <Text style={styles.permissionGateTitle}>We only ask for access when you choose to file an issue.</Text>
          <Text style={styles.permissionGateBody}>
            Your location pinpoints the issue on the map, and a photo is required as proof for verification.
          </Text>

          <View style={styles.permissionChecklist}>
            <View style={styles.permissionChecklistItem}>
              <Text style={styles.permissionChecklistLabel}>Location</Text>
              <Text style={styles.permissionChecklistText}>
                Required to attach accurate latitude and longitude to the report.
              </Text>
            </View>

            <View style={styles.permissionChecklistItem}>
              <Text style={styles.permissionChecklistLabel}>Image proof</Text>
              <Text style={styles.permissionChecklistText}>
                Required so authorities can verify what was reported.
              </Text>
            </View>
          </View>

          {locationError ? <Text style={styles.permissionErrorText}>{locationError}</Text> : null}
          {imageError ? <Text style={styles.permissionErrorText}>{imageError}</Text> : null}

          <View style={styles.permissionActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postButton, isPreparingReport && styles.postButtonDisabled]}
              onPress={handleContinueToReporting}
              disabled={isPreparingReport}
            >
              {isPreparingReport ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.postButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.createPostTitle}>Report Issue</Text>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={handlePostIssue}
          disabled={isSubmitting}
        >
          <Text style={styles.postButtonText}>{isSubmitting ? 'Posting...' : 'Submit'}</Text>
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
                <Text style={styles.composerLabel}>Describe the civic issue</Text>
                <Text style={styles.composerSubLabel}>
                  Browsing stays permission-free. Reporting uses your location and proof photo only for this issue.
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

            <View style={styles.locationCard}>
              <View style={styles.locationHeaderRow}>
                <View>
                  <Text style={styles.locationCardTitle}>Detected location</Text>
                  <Text style={styles.locationCardText}>
                    {resolvedAddress || formatCoordinates(coordinates)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.locationRefreshButton}
                  onPress={handleRefreshLocation}
                  disabled={isRefreshingLocation}
                >
                  {isRefreshingLocation ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Feather name="map-pin" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>

              {isResolvingAddress ? (
                <Text style={styles.locationCardHelper}>Looking up the nearest readable address...</Text>
              ) : null}
              {addressWarning ? <Text style={styles.locationCardWarning}>{addressWarning}</Text> : null}
              {locationError ? <Text style={styles.locationCardError}>{locationError}</Text> : null}
            </View>

            <View style={styles.imageUploadSection}>
              <View style={styles.imageUploadHeader}>
                <Text style={styles.imageUploadTitle}>Proof images</Text>
                <Text style={styles.imageUploadHelper}>
                  At least 1 image is required. You can use gallery or camera.
                </Text>
              </View>

              <View style={styles.imageSourceRow}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickFromGallery}>
                  <Text style={styles.imagePickerButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={handleCapturePhoto}>
                  <Text style={styles.imagePickerButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>

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

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Submission preview</Text>
              <Text style={styles.previewHelper}>
                The issue can only be submitted when both the detected location and proof image are present.
              </Text>
              {selectedImages[0] ? (
                <Image source={{ uri: selectedImages[0].uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewEmptyState}>
                  <Text style={styles.previewEmptyStateText}>Add an image to preview your report.</Text>
                </View>
              )}
              <Text style={styles.previewLocationLabel}>Location</Text>
              <Text style={styles.previewLocationText}>
                {resolvedAddress || formatCoordinates(coordinates)}
              </Text>
            </View>

            {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;
