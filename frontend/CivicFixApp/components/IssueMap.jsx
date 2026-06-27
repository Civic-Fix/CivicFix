import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Map, Camera, Marker, UserLocation } from '@maplibre/maplibre-react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { API_BASE_URL, MAP_API_KEY } from '../config';

const DEFAULT_CENTER = [88.3639, 22.5726];

const statusColors = {
  reported: '#2563EB',
  verified: '#0891B2',
  in_progress: '#F59E0B',
  review: '#7C3AED',
  completed: '#16A34A',
  closed: '#64748B',
  blocked: '#DC2626',
};

export default function IssueMap({ onOpenIssue }) {
  const cameraRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const loadMapIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/issues/map?limit=300`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load issues');

      const validIssues = (json.issues || [])
        .map(i => {
          const lat = Number(i.lat);
          const lng = Number(i.lng);
          if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { ...i, coordinates: [lng, lat] };
          }
          return null;
        })
        .filter(Boolean);

      setIssues(validIssues);
    } catch (e) {
      setError(e?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapIssues();
  }, [loadMapIssues]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation([loc.coords.longitude, loc.coords.latitude]);
    })();
  }, []);

  const handleFollowUser = async () => {
    if (!userLocation) return;
    cameraRef.current?.easeTo({
      center: userLocation,
      duration: 500,
    });
  };

  const handleResetView = () => {
    cameraRef.current?.easeTo({
      center: DEFAULT_CENTER,
      duration: 800,
    });
    setSelectedIssue(null);
  };

  const handleMarkerPress = issue => {
    setSelectedIssue(issue);
    cameraRef.current?.easeTo({
      center: issue.coordinates,
      duration: 600,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Issue Locations</Text>
          <Text style={styles.subtitle}>{issues.length} total issues nearby</Text>
        </View>

        <TouchableOpacity style={styles.refresh} onPress={loadMapIssues}>
          <Feather name="refresh-cw" size={14} color="#0F766E" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrap}>
        <Map
          style={styles.map}
          mapStyle={`https://api.maptiler.com/maps/streets-v4/style.json?key=${MAP_API_KEY}`}
          logo={false}
          attribution={false}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: DEFAULT_CENTER,
              zoom: 11,
            }}
          />

          <UserLocation accuracy heading />

          {issues.map(issue => (
            <Marker id={String(issue.id)} lngLat={issue.coordinates} onPress={() => handleMarkerPress(issue)}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: statusColors[issue.status] || statusColors.reported },
                ]}
              >
                <MaterialCommunityIcons name="alert" size={12} color="#fff" />
              </View>
            </Marker>
          ))}
        </Map>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleFollowUser}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#0B2D5C" />
            <Text style={styles.btnText}>Near Me</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={handleResetView}>
            <Feather name="map" size={16} color="#334155" />
            <Text style={styles.btnText}>Show All</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#0F766E" />
          </View>
        )}
      </View>

      <View style={styles.card}>
        {selectedIssue ? (
          <>
            <Text style={styles.cardTitle}>{selectedIssue.title}</Text>
            <Text style={styles.cardSub}>
              Status: {selectedIssue.status?.replace('_', ' ').toUpperCase() || 'REPORTED'}
            </Text>

            <TouchableOpacity style={styles.openBtn} onPress={() => onOpenIssue?.(selectedIssue.id)}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>Open Issue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.cardEmpty}>Tap a marker to view details</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

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
  statusText: { color: '#475569', fontSize: 12, marginTop: 4 }
});