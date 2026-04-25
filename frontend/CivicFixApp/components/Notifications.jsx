import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const Notifications = ({ issues }) => {
  const items = issues.slice(0, 4).map((issue) => ({
    id: issue.id,
    title: `${issue.author} posted an update`,
    body: issue.brief,
    time: issue.time,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Recent updates from the civic feed and your local area.</Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Feather name="bell" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.cardBody}>
                {item.body}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#666666',
    marginTop: 3,
    marginBottom: 14,
    fontSize: 12,
    paddingHorizontal: 16,
  },
  list: {
    gap: 12,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  copy: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardBody: {
    color: '#666666',
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    color: '#999999',
    fontSize: 12,
  },
});

export default Notifications;
