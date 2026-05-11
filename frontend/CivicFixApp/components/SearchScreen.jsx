import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import IssueCard from './IssueCard';

const SearchScreen = ({
  user,
  searchQuery,
  onSearchQueryChange,
  issues,
  searchResults,
  isSearchLoading,
  onRefresh,
  onOpenPostDetail,
  onOpenCommentForm,
  onVote,
  onDeletePost,
}) => {
  const trimmedQuery = searchQuery?.trim();
  const isSearching = Boolean(trimmedQuery);
  const results = isSearching ? searchResults : issues;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search issues, localities..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            returnKeyType="search"
          />
        </View>
        {Boolean(trimmedQuery) && (
          <TouchableOpacity onPress={() => onSearchQueryChange('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isSearchLoading} onRefresh={onRefresh} tintColor="#16A34A" />
        }
      >
        {isSearchLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#16A34A" style={{ marginBottom: 14 }} />
            <Text style={styles.loadingTitle}>Searching issues...</Text>
            <Text style={styles.loadingSubtitle}>We’re finding the best matches for your query.</Text>
          </View>
        ) : results.length > 0 ? (
          results.map((item) => (
            <IssueCard
              key={item.id}
              issue={item}
              onVote={onVote}
              onDelete={onDeletePost}
              currentHandle={user ? `@${user.name?.replace(/\s+/g, '').toLowerCase()}` : ''}
              onPress={onOpenPostDetail ? () => onOpenPostDetail(item) : undefined}
              onCommentPress={onOpenCommentForm ? () => onOpenCommentForm(item) : undefined}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {isSearching ? 'No results found' : 'No issues yet'}
            </Text>
            <Text style={styles.emptyStateText}> 
              {isSearching
                ? 'Try a different keyword or locality.'
                : 'Create a report or refresh to see the latest local issues.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#0F172A',
    fontSize: 15,
    padding: 0,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  clearButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 100,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  loadingSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchScreen;
