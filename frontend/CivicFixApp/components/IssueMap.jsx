import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../config';

const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 };
const DEFAULT_ZOOM = 13;
const MIN_ZOOM = 11;
const MAX_ZOOM = 16;
const TILE_SIZE = 256;
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
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Reported';

const toRad = (value) => (value * Math.PI) / 180;

const distanceMeters = (a, b) => {
  const earthRadius = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * earthRadius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const latLngToWorld = ({ lat, lng }, zoom = DEFAULT_ZOOM) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin(toRad(Math.max(Math.min(lat, 85.05112878), -85.05112878)));

  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
};

const worldToLatLng = ({ x, y }, zoom) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
};

const worldToTile = (value) => Math.floor(value / TILE_SIZE);

const buildTileGrid = (center, zoom, size) => {
  const centerWorld = latLngToWorld(center, zoom);
  const left = centerWorld.x - size.width / 2;
  const top = centerWorld.y - size.height / 2;
  const minTileX = worldToTile(left);
  const maxTileX = worldToTile(left + size.width);
  const minTileY = worldToTile(top);
  const maxTileY = worldToTile(top + size.height);
  const tiles = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      tiles.push({
        key: `${x}-${y}`,
        x,
        y,
        left: x * TILE_SIZE - left,
        top: y * TILE_SIZE - top,
      });
    }
  }

  return { centerWorld, left, top, tiles };
};

const IssueMap = ({ onOpenIssue }) => {
  const dragRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapSize, setMapSize] = useState({ width: 360, height: 440 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const loadMapIssues = useCallback(async ({ recenter = false } = {}) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/issues/map?limit=300`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to load map issues');
      }

      setIssues(Array.isArray(result.issues) ? result.issues : []);
      if (recenter && !userLocation && Array.isArray(result.issues) && result.issues.length) {
        const firstIssue = result.issues.find((issue) => Number.isFinite(Number(issue.lat)) && Number.isFinite(Number(issue.lng)));
        if (firstIssue) {
          setMapCenter({ lat: Number(firstIssue.lat), lng: Number(firstIssue.lng) });
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load map issues');
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    loadMapIssues({ recenter: true });
  }, []);

  const { left, top, tiles } = useMemo(() => buildTileGrid(mapCenter, zoom, mapSize), [mapCenter, zoom, mapSize]);

  const plottedIssues = useMemo(() => {
    const filtered = userLocation
      ? issues.filter((issue) => distanceMeters(userLocation, { lat: Number(issue.lat), lng: Number(issue.lng) }) <= RADIUS_METERS)
      : issues;

    return filtered
      .map((issue) => {
        const lat = Number(issue.lat);
        const lng = Number(issue.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const world = latLngToWorld({ lat, lng }, zoom);
        return {
          ...issue,
          x: world.x - left,
          y: world.y - top,
          distance: userLocation ? distanceMeters(userLocation, { lat, lng }) : null,
        };
      })
      .filter(Boolean)
      .filter((issue) => issue.x >= -24 && issue.x <= mapSize.width + 24 && issue.y >= -24 && issue.y <= mapSize.height + 24);
  }, [issues, left, top, userLocation, zoom, mapSize]);

  const selectedIssue = plottedIssues.find((issue) => issue.id === selectedIssueId) || plottedIssues[0] || null;

  const heatSpots = useMemo(
    () =>
      plottedIssues.map((issue) => ({
        id: `heat-${issue.id}`,
        x: issue.x,
        y: issue.y,
        intensity: plottedIssues.filter((other) => {
          const dx = other.x - issue.x;
          const dy = other.y - issue.y;
          return Math.sqrt(dx * dx + dy * dy) < 90;
        }).length,
      })),
    [plottedIssues]
  );

  const radiusPixels = useMemo(() => {
    if (!userLocation) return 0;
    const metersPerPixel =
      (156543.03392 * Math.cos(toRad(userLocation.lat))) / 2 ** zoom;
    return RADIUS_METERS / metersPerPixel;
  }, [userLocation, zoom]);

  const userWorld = userLocation ? latLngToWorld(userLocation, zoom) : null;
  const userPoint = userWorld ? { x: userWorld.x - left, y: userWorld.y - top } : null;

  const handleNearMe = async () => {
    setLocationStatus('');

    try {
      setLocationStatus('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationStatus('Location permission was denied. Enable it in your browser settings.');
        return;
      }

      setLocationStatus('Detecting your location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 0,
      });
      const nextLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(nextLocation);
      setMapCenter(nextLocation);
      setZoom(14);
      setSelectedIssueId(null);
      setLocationStatus('Showing issues within 3 km of you.');
    } catch (err) {
      setLocationStatus(err.message || 'Unable to detect your current location.');
    }
  };

  const clearNearMe = () => {
    setUserLocation(null);
    setLocationStatus('');
    setSelectedIssueId(null);
    const firstIssue = issues.find((issue) => Number.isFinite(Number(issue.lat)) && Number.isFinite(Number(issue.lng)));
    if (firstIssue) {
      setMapCenter({ lat: Number(firstIssue.lat), lng: Number(firstIssue.lng) });
      setZoom(DEFAULT_ZOOM);
    }
  };

  const commitPanByPixels = (dx, dy) => {
    if (!dx && !dy) return;
    const currentWorld = latLngToWorld(mapCenter, zoom);
    setMapCenter(worldToLatLng({ x: currentWorld.x - dx, y: currentWorld.y - dy }, zoom));
  };

  const handlePointerDown = (event) => {
    const nativeEvent = event.nativeEvent || event;
    dragRef.current = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
      totalX: 0,
      totalY: 0,
    };
    event.currentTarget?.setPointerCapture?.(nativeEvent.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const { pageX, pageY } = event.nativeEvent || event;
    const dx = pageX - drag.x;
    const dy = pageY - drag.y;
    const next = {
      x: pageX,
      y: pageY,
      totalX: drag.totalX + dx,
      totalY: drag.totalY + dy,
    };
    dragRef.current = next;
    setDragOffset({ x: next.totalX, y: next.totalY });
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    commitPanByPixels(drag.totalX, drag.totalY);
    setDragOffset({ x: 0, y: 0 });
    dragRef.current = null;
    const nativeEvent = event.nativeEvent || event;
    event.currentTarget?.releasePointerCapture?.(nativeEvent.pointerId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Map</Text>
          <Text style={styles.title}>Issue Locations</Text>
          <Text style={styles.subtitle}>
            {userLocation
              ? `${plottedIssues.length} issues inside 3 km`
              : `${issues.length} issues with exact coordinates`}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => loadMapIssues()} activeOpacity={0.8}>
          <Feather name="refresh-cw" size={15} color="#0F766E" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapToolbar}>
          <View style={styles.mapStatPill}>
            <MaterialCommunityIcons name="map-marker-multiple" size={14} color="#0F766E" />
            <Text style={styles.mapStatText}>{plottedIssues.length} visible</Text>
          </View>
          <View style={styles.mapStatPill}>
            <View style={styles.heatLegendDot} />
            <Text style={styles.mapStatText}>Hotspots</Text>
          </View>
          {userLocation ? (
            <View style={styles.mapStatPill}>
              <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#2563EB" />
              <Text style={styles.mapStatText}>3 km radius</Text>
            </View>
          ) : null}
        </View>

        <View
          style={styles.mapViewport}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            if (width && height) setMapSize({ width, height });
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {tiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png` }}
              style={[styles.tile, { left: tile.left + dragOffset.x, top: tile.top + dragOffset.y }]}
            />
          ))}

          {userPoint ? (
            <View
              pointerEvents="none"
              style={[
                styles.radiusCircle,
                {
                  width: radiusPixels * 2,
                  height: radiusPixels * 2,
                  borderRadius: radiusPixels,
                  left: userPoint.x - radiusPixels + dragOffset.x,
                  top: userPoint.y - radiusPixels + dragOffset.y,
                },
              ]}
            />
          ) : null}

          {heatSpots.map((spot) => (
            <View key={spot.id} pointerEvents="none">
              <View
                style={[
                  styles.heatOuter,
                  {
                    left: spot.x - 72 + dragOffset.x,
                    top: spot.y - 72 + dragOffset.y,
                    opacity: Math.min(0.24 + spot.intensity * 0.04, 0.42),
                  },
                ]}
              />
              <View
                style={[
                  styles.heatMiddle,
                  {
                    left: spot.x - 46 + dragOffset.x,
                    top: spot.y - 46 + dragOffset.y,
                    opacity: Math.min(0.3 + spot.intensity * 0.05, 0.55),
                  },
                ]}
              />
              <View
                style={[
                  styles.heatCore,
                  {
                    left: spot.x - 22 + dragOffset.x,
                    top: spot.y - 22 + dragOffset.y,
                    opacity: Math.min(0.35 + spot.intensity * 0.06, 0.65),
                  },
                ]}
              />
            </View>
          ))}

          {userPoint ? (
            <View style={[styles.userDot, { left: userPoint.x - 8 + dragOffset.x, top: userPoint.y - 8 + dragOffset.y }]}>
              <View style={styles.userDotInner} />
            </View>
          ) : null}

          {plottedIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              activeOpacity={0.8}
              onPress={() => setSelectedIssueId(issue.id)}
              style={[
                styles.issuePin,
                {
                  left: issue.x - 12 + dragOffset.x,
                  top: issue.y - 24 + dragOffset.y,
                  backgroundColor: statusColors[issue.status] || statusColors.reported,
                },
                selectedIssueId === issue.id && styles.issuePinSelected,
              ]}
            >
              <MaterialCommunityIcons name="alert" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          ))}

          {isLoading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#0F766E" />
              <Text style={styles.loadingText}>Loading map issues...</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.nearMeButton} onPress={handleNearMe} activeOpacity={0.85}>
            <MaterialCommunityIcons name="crosshairs-gps" size={19} color="#0B2D5C" />
            <Text style={styles.nearMeText}>Near me</Text>
          </TouchableOpacity>

          {userLocation ? (
            <TouchableOpacity style={styles.showAllButton} onPress={clearNearMe} activeOpacity={0.85}>
              <Feather name="x" size={14} color="#475569" />
              <Text style={styles.showAllText}>Show all</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom((current) => Math.min(MAX_ZOOM, current + 1))}>
              <Text style={styles.zoomButtonText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom((current) => Math.max(MIN_ZOOM, current - 1))}>
              <Text style={styles.zoomButtonText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mapFooter}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {locationStatus ? <Text style={styles.locationStatus}>{locationStatus}</Text> : null}
          {userLocation && plottedIssues.length === 0 ? (
            <Text style={styles.locationStatus}>No issues were found inside your 3 km radius. Use Show all to return to the city map.</Text>
          ) : null}
          <Text style={styles.attribution}>Map data © OpenStreetMap contributors</Text>
        </View>
      </View>

      {selectedIssue ? (
        <View style={styles.issuePreview}>
          <View style={styles.previewHeader}>
            <View style={[styles.previewStatusDot, { backgroundColor: statusColors[selectedIssue.status] || statusColors.reported }]} />
            <Text style={styles.previewStatus}>{formatStatus(selectedIssue.status)}</Text>
            {selectedIssue.distance !== null ? (
              <Text style={styles.previewDistance}>{(selectedIssue.distance / 1000).toFixed(1)} km away</Text>
            ) : null}
          </View>
          <Text style={styles.previewTitle}>{selectedIssue.title || 'Untitled issue'}</Text>
          <TouchableOpacity style={styles.openIssueButton} onPress={() => onOpenIssue?.(selectedIssue.id)} activeOpacity={0.85}>
            <Text style={styles.openIssueText}>Open issue</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.issuePreview}>
          <Text style={styles.previewTitle}>No issues found in this view.</Text>
          <Text style={styles.locationStatus}>
            {userLocation ? 'There are no coordinate-tagged issues inside 3 km.' : 'Try refreshing the map.'}
          </Text>
          {userLocation ? (
            <TouchableOpacity style={styles.clearPreviewButton} onPress={clearNearMe} activeOpacity={0.85}>
              <Text style={styles.clearPreviewText}>Show all issues</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 88,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
    marginBottom: 3,
  },
  title: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  refreshText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
  },
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  mapToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  mapStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mapStatText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  heatLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  mapViewport: {
    height: 500,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#DDE8EF',
    cursor: 'grab',
    touchAction: 'pan-y',
    userSelect: 'none',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  issuePin: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.25)',
  },
  issuePinSelected: {
    transform: [{ scale: 1.16 }],
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
  },
  userDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  radiusCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  heatOuter: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: '#F97316',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  heatMiddle: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F59E0B',
  },
  heatCore: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
  },
  nearMeButton: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.18)',
  },
  zoomControls: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 38,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.16)',
  },
  zoomButton: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    color: '#0B2D5C',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  nearMeText: {
    color: '#0B2D5C',
    fontSize: 13,
    fontWeight: '800',
  },
  showAllButton: {
    position: 'absolute',
    right: 14,
    bottom: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.14)',
  },
  showAllText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  mapFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  attribution: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  locationStatus: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  issuePreview: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  previewStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewStatus: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
  previewDistance: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  previewTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  openIssueButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  openIssueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  clearPreviewButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  clearPreviewText: {
    color: '#0B2D5C',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default IssueMap;
