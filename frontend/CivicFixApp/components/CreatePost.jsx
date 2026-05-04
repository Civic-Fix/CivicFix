import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import styles from './FeedsStyles';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
// const API_BASE_URL ='http://localhost:5000/api';
const MAX_IMAGES = 6;

const formatCoordinates = ({ lat, lng }) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

const formatLocationDisplay = (locality, coordinates) => {
  const trimmedLocality = typeof locality === 'string' ? locality.trim() : '';
  if (!coordinates) return trimmedLocality || 'No pin selected';
  const coordinateText = formatCoordinates(coordinates);
  return trimmedLocality ? `${trimmedLocality} (${coordinateText})` : coordinateText;
};

const formatStatus = (status) =>
  status
    ? status
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Reported';

const buildAttachmentPayload = (images = []) =>
  images.map((image) => ({
    file_url: image.uri,
    file_type: image.file_type || image.mimeType || 'image/jpeg',
  }));

const isAuthError = (error) =>
  error?.status === 401 ||
  /invalid token|session expired|missing or invalid token|unauthorized/i.test(error?.message || '');

const buildRequestError = (message, status) => {
  const error = new Error(message || 'Request failed');
  error.status = status;
  return error;
};

const getCurrentLocation = async () => {
  try {
    // Request location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied. Please enable location services in settings.');
    }

    // Get current location with high accuracy
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 0,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    throw new Error(error.message || 'Unable to retrieve location. Please try again.');
  }
};

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
    mimeType: asset.mimeType || 'image/jpeg',
    base64: asset.base64 || '',
  }));

const CreatePost = ({ user, onPostCreated, onCancel }) => {
  const [displayName, setDisplayName] = useState('CivicFix User');
  const [titleText, setTitleText] = useState('');
  const [issueText, setIssueText] = useState('');
  const [localityText, setLocalityText] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [imageError, setImageError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [localityError, setLocalityError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [addressWarning, setAddressWarning] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const displayNameToUse = isAnonymous ? 'Anonymous' : displayName;

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
      setLocationError(error.message || 'Unable to detect your current location');
      return null;
    } finally {
      if (isRetry) {
        setIsRefreshingLocation(false);
      }
    }
  };

  const handlePickFromGallery = async () => {
    if (!mediaPermissionGranted) {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaPermissionGranted(permission.granted);

      if (!permission.granted) {
        setImageError('Photo library access was not allowed. You can still submit without images.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
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
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermissionGranted(permission.granted);

      if (!permission.granted) {
        setImageError('Camera access was not allowed. You can still submit without images.');
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
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
  };

  const handleRefreshLocation = async () => {
    await requestLocationAccess({ isRetry: true });
  };

  const handlePostIssue = async () => {
    setSubmitError('');
    setInfoMessage('');

    if (!titleText.trim()) {
      const message = 'Please add a title for the issue before posting.';
      setTitleError(message);
      Alert.alert('Missing title', message);
      return;
    }

    if (!issueText.trim()) {
      const message = 'Please describe the issue before posting.';
      setInfoMessage(message);
      Alert.alert('Missing description', message);
      return;
    }

    if (!localityText.trim()) {
      const message = 'Please enter the locality for this issue.';
      setLocalityError(message);
      Alert.alert('Missing locality', message);
      return;
    }

    setIsSubmitting(true);
    setInfoMessage('');
    setLocationError('');
    setImageError('');
    setTitleError('');
    setLocalityError('');
    setSubmitError('');

    const locality = localityText.trim();
    const issueCoordinates = coordinates;
    const displayLocation = formatLocationDisplay(locality, issueCoordinates);

    const localPost = {
      id: Date.now().toString(),
      author: displayNameToUse,
      handle: `@${displayNameToUse.replace(/\s+/g, '').toLowerCase()}`,
      anonymous: isAnonymous,
      time: 'Just now',
      title: titleText.trim(),
      brief: issueText.trim(),
      locality,
      location: displayLocation,
      coordinateLocation: issueCoordinates ? formatCoordinates(issueCoordinates) : '',
      status: 'Reported',
      image: selectedImages[0]?.uri,
      images: selectedImages,
      upvotes: 0,
      downvotes: 0,
      lat: issueCoordinates?.lat ?? null,
      lng: issueCoordinates?.lng ?? null,
    };

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      let syncedPost = localPost;

      if (authToken) {
        const uploadResponses = await Promise.all(
          selectedImages.map(async (image) => {
            const uploadResponse = await fetch(`${API_BASE_URL}/issues/attachments/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                file_name: image.fileName || 'issue-proof.jpg',
                mime_type: image.mimeType || 'image/jpeg',
                file_data_base64: image.base64,
              }),
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
              throw buildRequestError(
                uploadResult.error || 'Unable to upload proof image',
                uploadResponse.status
              );
            }

            return uploadResult.asset;
          })
        );

        const response = await fetch(`${API_BASE_URL}/issues`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            title: titleText.trim(),
            description: issueText.trim(),
            locality,
            lat: issueCoordinates?.lat ?? null,
            lng: issueCoordinates?.lng ?? null,
            status: 'reported',
            attachments: buildAttachmentPayload(
              uploadResponses.map((asset) => ({
                uri: asset.file_url,
                file_type: asset.file_type,
              }))
            ),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw buildRequestError(result.error || 'Unable to create issue', response.status);
        }

        const createdIssue = result.issue;
        const primaryImage = createdIssue?.attachments?.[0]?.file_url || selectedImages[0]?.uri;
        const syncedCoordinates =
          typeof createdIssue?.lat === 'number' && typeof createdIssue?.lng === 'number'
            ? { lat: createdIssue.lat, lng: createdIssue.lng }
            : issueCoordinates;
        const syncedLocation = formatLocationDisplay(createdIssue?.locality || locality, syncedCoordinates);

        syncedPost = {
          ...localPost,
          id: createdIssue?.id || localPost.id,
          brief: createdIssue?.description || createdIssue?.title || localPost.brief,
          locality: createdIssue?.locality || locality,
          location: syncedLocation,
          coordinateLocation: syncedCoordinates ? formatCoordinates(syncedCoordinates) : '',
          status: formatStatus(createdIssue?.status),
          image: primaryImage,
          images:
            createdIssue?.attachments?.map((attachment) => ({
              uri: attachment.file_url,
              fileName: attachment.file_url?.split('/').pop() || 'issue-proof.jpg',
            })) || localPost.images,
          upvotes: createdIssue?.vote_count ?? localPost.upvotes,
          lat: createdIssue?.lat ?? localPost.lat,
          lng: createdIssue?.lng ?? localPost.lng,
          anonymous: isAnonymous,
        };
      } else {
        setInfoMessage('Posted locally. Log in again if you want it synced to the server.');
      }

      onPostCreated(syncedPost);
    } catch (error) {
      let message = error.message || 'Unable to create issue right now.';

      if (isAuthError(error)) {
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
        message = 'Your login session expired. Please log in again, then submit the report.';
      }

      setSubmitError(message);
      Alert.alert('Submit failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
          <Feather name="arrow-left" size={16} color="#047857" />
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.createPostTitle}>Report Issue</Text>
        <TouchableOpacity
          style={[styles.postButton, isSubmitting && styles.postButtonDisabled]}
          onPress={handlePostIssue}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Feather name="send" size={15} color="#FFFFFF" />
          )}
          <Text style={styles.postButtonText}>{isSubmitting ? 'Posting' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
      {submitError ? (
        <View style={styles.submitErrorBanner}>
          <Text style={styles.submitErrorBannerText}>{submitError}</Text>
        </View>
      ) : null}

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
                <Feather name="edit-3" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.composerTitle}>
                <Text style={styles.composerLabel}>New civic report</Text>
                <Text style={styles.composerSubLabel}>
                  Locality is required. Photos and exact location are optional.
                </Text>
              </View>
            </View>

            <View style={styles.inputIconWrap}>
              <Feather name="type" size={16} color="#059669" />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Issue title"
                placeholderTextColor="#64748B"
                underlineColorAndroid="transparent"
                selectionColor="#60A5FA"
                value={titleText}
                onChangeText={(text) => {
                  setTitleText(text);
                  if (titleError) setTitleError('');
                }}
                returnKeyType="next"
              />
            </View>
            {titleError ? <Text style={styles.titleErrorText}>{titleError}</Text> : null}

            <View style={styles.textAreaWrap}>
              <Feather name="align-left" size={16} color="#059669" style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue you saw..."
                placeholderTextColor="#64748B"
                underlineColorAndroid="transparent"
                selectionColor="#60A5FA"
                multiline
                value={issueText}
                onChangeText={setIssueText}
              />
            </View>

            <View style={styles.inputIconWrap}>
              <Feather name="map-pin" size={16} color="#059669" />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Locality, area, or landmark"
                placeholderTextColor="#64748B"
                underlineColorAndroid="transparent"
                selectionColor="#60A5FA"
                value={localityText}
                onChangeText={(text) => {
                  setLocalityText(text);
                  if (localityError) setLocalityError('');
                }}
                returnKeyType="next"
              />
            </View>
            {localityError ? <Text style={styles.titleErrorText}>{localityError}</Text> : null}

            <View style={styles.anonymousToggleRow}>
              <View style={styles.anonymousLabelRow}>
                <Feather name="eye-off" size={15} color="#475569" />
                <Text style={styles.anonymousToggleLabel}>Post anonymously</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.anonymousToggleButton,
                  isAnonymous && styles.anonymousToggleButtonActive,
                ]}
                onPress={() => setIsAnonymous((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.anonymousToggleButtonText,
                    isAnonymous && styles.anonymousToggleButtonTextActive,
                  ]}
                >
                  {isAnonymous ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.locationCard}>
              <View style={styles.locationHeaderRow}>
                <View>
                  <View style={styles.sectionTitleRow}>
                    <Feather name="navigation" size={15} color="#047857" />
                    <Text style={styles.locationCardTitle}>Exact location pin</Text>
                  </View>
                  <Text style={styles.locationCardText}>
                    {resolvedAddress || (coordinates ? formatCoordinates(coordinates) : 'Optional. Detect your current location.')}
                  </Text>
                </View>
              </View>

              <View style={styles.locationActionRow}>
                <TouchableOpacity
                  style={styles.detectLocationButton}
                  onPress={handleRefreshLocation}
                  disabled={isRefreshingLocation}
                >
                  {isRefreshingLocation ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <Feather name="map-pin" size={16} color="#16A34A" />
                  )}
                  <Text style={styles.detectLocationButtonText}>Detect current location</Text>
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
                <View style={styles.sectionTitleRow}>
                  <Feather name="image" size={15} color="#047857" />
                  <Text style={styles.imageUploadTitle}>Proof images</Text>
                </View>
                <Text style={styles.imageUploadHelper}>
                  Optional. You can add images from gallery or camera.
                </Text>
              </View>

              <View style={styles.imageSourceRow}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={handlePickFromGallery}>
                  <Feather name="image" size={16} color="#047857" />
                  <Text style={styles.imagePickerButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={handleCapturePhoto}>
                  <Feather name="camera" size={16} color="#047857" />
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
              <View style={styles.previewHeaderRow}>
                <View style={styles.previewIcon}>
                  <Feather name="file-text" size={17} color="#FFFFFF" />
                </View>
                <View style={styles.composerTitle}>
                  <Text style={styles.previewTitle}>Preview</Text>
                  <Text style={styles.previewHelper}>How the report will read in the feed.</Text>
                </View>
              </View>
              {selectedImages[0] ? (
                <Image source={{ uri: selectedImages[0].uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewEmptyState}>
                  <Text style={styles.previewEmptyStateText}>Add an image to preview your report.</Text>
                </View>
              )}
              <Text style={styles.previewLocationLabel}>Title</Text>
              <Text style={styles.previewLocationText}>{titleText.trim() || 'No title yet'}</Text>
              <Text style={[styles.previewLocationLabel, { marginTop: 10 }]}>Location</Text>
              <Text style={styles.previewLocationText}>
                {formatLocationDisplay(localityText, coordinates)}
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
