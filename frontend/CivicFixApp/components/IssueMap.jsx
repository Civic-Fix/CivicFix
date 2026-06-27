import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Circle, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { API_BASE_URL, MAP_API_KEY } from '../config';

const DEFAULT_REGION = {
  latitude: 22.5726,
  longitude: 88.3639,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const RADIUS_METERS = 3000;

const statusColors = {
  reported: '#2563EB',
  verified: '#0891B2',
  in_progress: '#F59E0B',
  review: '#7C3AED',
  completed: '#16A34A',
  closed: '#64748B',
  blocked: '#DC2626',
};

const formatStatus = (status) =>
  status
    ? status
      .split('_')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
    : 'Reported';

const toRad = (v) => (v * Math.PI) / 180;

const distanceMeters = (a, b) => {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const getIssueCoordinates = (issue) => {
  const lat = Number(issue?.lat);
  const lng = Number(issue?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { latitude: lat, longitude: lng };
};

const IssueMap = ({ issues: allIssues = [], onOpenIssue }) => {
  const mapRef = useRef(null);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [region, setRegion] = useState(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  const [selectedIssue, setSelectedIssue] = useState(null);

  const loadMapIssues = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/issues/map?limit=300`);
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || 'Failed to load issues');

      setIssues(Array.isArray(json.issues) ? json.issues : []);
    } catch (e) {
      setError(e.message || 'Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapIssues();
  }, [loadMapIssues]);

  const coordinateIssues = useMemo(
    () =>
      issues
        .map((i) => {
          const coords = getIssueCoordinates(i);
          return coords ? { ...i, coordinates: coords } : null;
        })
        .filter(Boolean),
    [issues]
  );

  const visibleIssues = useMemo(() => {
    if (!userLocation) return coordinateIssues;

    return coordinateIssues.filter((i) => {
      return (
        distanceMeters(userLocation, i.coordinates) <= RADIUS_METERS
      );
    });
  }, [coordinateIssues, userLocation]);

  const handleNearMe = async () => {
    try {
      setLocationStatus('Requesting permission...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Permission denied');
        return;
      }

      setLocationStatus('Getting location...');

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const current = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setUserLocation(current);

      const newRegion = {
        latitude: current.latitude,
        longitude: current.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 800);

      setLocationStatus('Showing 3 km radius');
    } catch (e) {
      setLocationStatus(e.message || 'Failed to get location');
    }
  };

  const clearNearMe = () => {
    setUserLocation(null);
    setLocationStatus('');
    setSelectedIssue(null);

    setRegion(DEFAULT_REGION);
    mapRef.current?.animateToRegion(DEFAULT_REGION, 800);
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Issue Locations</Text>
          <Text style={styles.subtitle}>
            {userLocation
              ? `${visibleIssues.length} issues within 3 km`
              : `${coordinateIssues.length} issues`}
          </Text>
        </View>

        <TouchableOpacity style={styles.refresh} onPress={loadMapIssues}>
          <Feather name="refresh-cw" size={14} color="#0F766E" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <View style={styles.mapWrap}>

        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="none"
        >
          <UrlTile
            urlTemplate={`https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${MAP_API_KEY}`}
            maximumZ={20}
            flipY={false}
          />

          {/* RADIUS */}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={RADIUS_METERS}
              strokeColor="rgba(37,99,235,0.8)"
              fillColor="rgba(37,99,235,0.15)"
            />
          )}

          {/* ISSUES */}
          {visibleIssues.map((issue) => {
            const coords = issue.coordinates;

            return (
              <Marker
                key={issue.id}
                coordinate={coords}
                onPress={() => setSelectedIssue(issue)}
              >
                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor:
                        statusColors[issue.status] || statusColors.reported,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="alert"
                    size={12}
                    color="#fff"
                  />
                </View>
              </Marker>
            );
          })}

        </MapView>

        {/* NEAR ME */}
        <TouchableOpacity style={styles.nearMe} onPress={handleNearMe}>
          <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#0B2D5C" />
          <Text style={styles.nearMeText}>Near me</Text>
        </TouchableOpacity>

        {userLocation && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearNearMe}>
            <Feather name="x" size={14} color="#334155" />
            <Text style={styles.clearText}>Show all</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#0F766E" />
            <Text style={{ marginTop: 6 }}>Loading...</Text>
          </View>
        )}

      </View>

      {/* FOOTER / ISSUE CARD */}
      <View style={styles.card}>
        {selectedIssue ? (
          <>
            <Text style={styles.cardTitle}>{selectedIssue.title}</Text>

            <Text style={styles.cardSub}>
              {formatStatus(selectedIssue.status)}
            </Text>

            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => onOpenIssue?.(selectedIssue.id)}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                Open Issue
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.cardEmpty}>
            Tap a marker to see issue details
          </Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {locationStatus ? <Text>{locationStatus}</Text> : null}
      </View>

    </View>
  );
};

export default IssueMap;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B' },

  refresh: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  refreshText: { color: '#0F766E', fontWeight: '700', fontSize: 12 },

  mapWrap: {
    flex: 1,
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },

  map: { flex: 1 },

  marker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  nearMe: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  nearMeText: { fontWeight: '800', color: '#0B2D5C' },

  clearBtn: {
    position: 'absolute',
    bottom: 70,
    right: 16,
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  clearText: { fontWeight: '700' },

  loading: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
  },

  card: {
    padding: 14,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 14,
  },

  cardTitle: { fontSize: 16, fontWeight: '900' },
  cardSub: { fontSize: 12, color: '#64748B', marginTop: 4 },

  openBtn: {
    marginTop: 10,
    backgroundColor: '#0F766E',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  cardEmpty: { color: '#64748B' },
  error: { color: '#DC2626', marginTop: 6 },
});