import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const isOpenIssueStatus = (status) =>
  ['reported', 'verified', 'in_progress', 'review'].includes(status);

const createHtmlSource = (issues) => {
  const markers = issues.map((issue) => ({
    id: issue.id,
    title: issue.title || `Issue #${issue.id}`,
    locality: issue.locality || '',
    lat: issue.lat,
    lng: issue.lng,
  }));

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { margin: 0; height: 100%; width: 100%; }
      .leaflet-popup-content-wrapper { border-radius: 16px; }
      .leaflet-popup-content button { appearance: none; border: none; background: #047857; color: white; padding: 10px 14px; border-radius: 999px; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      function safeText(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function popupHtml(issue) {
        return (
          '<div style="min-width:220px;font-family:sans-serif;">' +
            '<div style="font-size:16px;font-weight:800;margin-bottom:6px;">' +
              safeText(issue.title) +
            '</div>' +

            '<div style="margin-bottom:10px;color:#475569;font-weight:600;">' +
              safeText(issue.locality) +
            '</div>' +

            '<button onclick="window.ReactNativeWebView.postMessage(\'' + issue.id + '\')">' +
              'Open issue' +
            '</button>' +
          '</div>'
        );
      }

      const issues = ${JSON.stringify(markers)};
      const map = L.map('map', { zoomControl: true }).setView([22.5726, 88.3639], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const validMarkers = issues
        .filter((issue) => Number.isFinite(issue.lat) && Number.isFinite(issue.lng))
        .map((issue) => {
          const marker = L.marker([issue.lat, issue.lng]).addTo(map);
          marker.bindPopup(popupHtml(issue), { minWidth: 240, maxWidth: 320 });
          return marker;
        });

      if (validMarkers.length) {
        const group = L.featureGroup(validMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    </script>
  </body>
</html>`;
};

export default function MapScreen({ issues, onOpenPostDetail }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  const openIssues = useMemo(
    () => issues.filter((issue) => isOpenIssueStatus(issue.status)),
    [issues]
  );

  return (
    <View style={styles.mapScreenContainer}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Open issue map</Text>
        <Text style={styles.mapSubtitle}>Tap a marker to preview the issue and open its detail page.</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: createHtmlSource(openIssues) }}
          onLoadEnd={() => setIsMapLoading(false)}
          style={styles.webView}
          onMessage={(event) => {
            const issueId = event.nativeEvent.data;
            const issue = issues.find((item) => item.id === issueId);
            if (issue) {
              setSelectedIssue(issue);
            }
          }}
        />
        {isMapLoading ? (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#0F766E" />
            <Text style={styles.mapLoadingText}>Loading map…</Text>
          </View>
        ) : null}
      </View>

      {selectedIssue ? (
        <View style={styles.mapModal}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>{selectedIssue.title}</Text>
            <TouchableOpacity onPress={() => setSelectedIssue(null)}>
              <Text style={styles.mapModalClose}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mapModalLocation}>{selectedIssue.locality || 'Location unavailable'}</Text>
          <Text style={styles.mapModalDescription}>{selectedIssue.brief}</Text>
          <TouchableOpacity
            style={styles.mapModalButton}
            onPress={() => {
              setSelectedIssue(null);
              onOpenPostDetail(selectedIssue);
            }}
          >
            <Text style={styles.mapModalButtonText}>View issue</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  mapScreenContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mapHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  webView: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 250, 252, 0.86)',
  },
  mapLoadingText: {
    marginTop: 12,
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  mapModal: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 86,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 14,
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mapModalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 10,
  },
  mapModalClose: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  mapModalLocation: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  mapModalDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  mapModalButton: {
    marginTop: 16,
    backgroundColor: '#0F766E',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mapModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
