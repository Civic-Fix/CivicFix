import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Login from './components/Login';
import Signup from './components/Signup';
import Feeds from './components/Feeds';
import CreatePost from './components/CreatePost';
import Notifications from './components/Notifications';
import CivicAssistant from './components/CivicAssistant';

const initialFeed = [
  {
    id: '1',
    author: 'CityWatch',
    handle: '@citywatch',
    time: '2h',
    brief: 'Broken streetlight on Oak Avenue near the park. Please assign a crew for repair.',
    location: 'Oak Avenue Park, Sector 4',
    status: 'Open',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    upvotes: 24,
    downvotes: 3,
  },
  {
    id: '2',
    author: 'Neighbour',
    handle: '@neighborly',
    time: '5h',
    brief: 'Overflowing trash bin at the corner of 3rd and Elm. Health concern for passersby.',
    location: '3rd St & Elm',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    upvotes: 18,
    downvotes: 1,
  },
];

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState(initialFeed);
  const [activeTab, setActiveTab] = useState('home');

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setScreen('feeds');
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userInfo']);
    setUser(null);
    setScreen('login');
  };

  const handleCreatePost = (newPost) => {
    setIssues((prev) => [newPost, ...prev]);
    setScreen('feeds');
    setActiveTab('home');
  };

  const handleVote = (id, type) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id !== id) {
          return issue;
        }

        return {
          ...issue,
          upvotes: type === 'upvote' ? issue.upvotes + 1 : issue.upvotes,
          downvotes: type === 'downvote' ? issue.downvotes + 1 : issue.downvotes,
        };
      })
    );
  };

  const handleDeletePost = (id) => {
    setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== id));
  };

  const renderMainScreen = () => {
    if (activeTab === 'notifications') {
      return <Notifications issues={issues} />;
    }

    if (activeTab === 'assistant') {
      return <CivicAssistant user={user} />;
    }

    return (
      <Feeds
        user={user}
        issues={issues}
        onVote={handleVote}
        onDeletePost={handleDeletePost}
        onLogout={handleLogout}
        onOpenCreatePost={() => setScreen('createPost')}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'login' ? (
        <Login
          onSignupPress={() => setScreen('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : screen === 'signup' ? (
        <Signup onLoginPress={() => setScreen('login')} />
      ) : screen === 'createPost' ? (
        <CreatePost
          user={user}
          onPostCreated={handleCreatePost}
          onCancel={() => setScreen('feeds')}
        />
      ) : (
        <View style={styles.appShell}>
          <View style={styles.mainContent}>{renderMainScreen()}</View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomItem} onPress={() => setActiveTab('home')}>
              <Feather
                name="home"
                size={22}
                color={activeTab === 'home' ? '#FFFFFF' : '#6B7280'}
              />
              <Text style={[styles.bottomLabel, activeTab === 'home' && styles.bottomLabelActive]}>
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomCenterItem}
              onPress={() => setActiveTab('assistant')}
            >
              <View style={styles.bottomCenterButton}>
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={28}
                  color={activeTab === 'assistant' ? '#000000' : '#111111'}
                />
              </View>
              <Text
                style={[
                  styles.bottomLabel,
                  activeTab === 'assistant' && styles.bottomLabelActive,
                ]}
              >
                CivicBot
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bottomItem}
              onPress={() => setActiveTab('notifications')}
            >
              <Feather
                name="bell"
                size={22}
                color={activeTab === 'notifications' ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.bottomLabel,
                  activeTab === 'notifications' && styles.bottomLabelActive,
                ]}
              >
                Alerts
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  appShell: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContent: {
    flex: 1,
  },
  bottomBar: {
    height: 68,
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#18181B',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  bottomCenterItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -16,
  },
  bottomCenterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
  },
  bottomLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomLabelActive: {
    color: '#FFFFFF',
  },
});
