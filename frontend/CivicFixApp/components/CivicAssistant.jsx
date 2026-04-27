import React, { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

const starterMessages = [
  {
    id: '1',
    role: 'assistant',
    text: 'Ask about civic complaints, RTI, local authority duties, public nuisance, or your basic civic rights. I provide general guidance, not formal legal advice.',
  },
];

const SUGGESTIONS = [
  'How do I file an RTI?',
  'Report a pothole',
  'Garbage not collected',
  'Water supply issue',
];

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const getFallbackReply = (question) => {
  const q = question.toLowerCase();
  if (q.includes('rti')) return 'You can use RTI to request records, status updates, action taken reports, and official information from public authorities.';
  if (q.includes('garbage') || q.includes('waste') || q.includes('sanitation')) return 'For sanitation complaints, keep photos, exact location, and dates. Report to the local municipal body first, then escalate with evidence.';
  if (q.includes('road') || q.includes('pothole')) return 'For road or pothole complaints, record the exact location, risk to the public, and repeat incidents. Documentation helps escalation.';
  if (q.includes('water') || q.includes('drainage')) return 'For water or drainage issues, document the service disruption, impact on residents, and any health risk. A written complaint with evidence is usually the best first step.';
  return 'I could not reach the live civic guidance service right now. Try asking about RTI, sanitation, roads, drainage, or civic complaint escalation.';
};

const CivicAssistant = ({ user }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const scrollRef = useRef(null);

  const displayName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Citizen';
  }, [user]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = { id: `${Date.now()}-user`, role: 'user', text: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setErrorText('');
    setIsLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to get a response from CivicBot.');

      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: 'assistant', text: result.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: `${Date.now()}-fallback`, role: 'assistant', text: getFallbackReply(trimmed) }]);
      setErrorText(
        error?.message?.includes('fetch')
          ? 'Live CivicBot is unreachable. Showing offline guidance.'
          : error.message || 'Unable to get a response.'
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.botAvatar}>
          <MaterialCommunityIcons name="robot-outline" size={22} color="#16A34A" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>CivicBot</Text>
          <Text style={styles.subtitle}>Civic guidance for {displayName} · Not legal advice</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubbleRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}
          >
            {message.role === 'assistant' ? (
              <View style={styles.botAvatarSmall}>
                <MaterialCommunityIcons name="robot-outline" size={14} color="#16A34A" />
              </View>
            ) : null}
            <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.bubbleText, message.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText]}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}

        {isLoading ? (
          <View style={[styles.bubbleRow, styles.assistantRow]}>
            <View style={styles.botAvatarSmall}>
              <MaterialCommunityIcons name="robot-outline" size={14} color="#16A34A" />
            </View>
            <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
        ) : null}

        {/* Suggestions (only when few messages) */}
        {messages.length <= 1 ? (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)} activeOpacity={0.75}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {errorText ? (
        <View style={styles.errorBanner}>
          <Feather name="wifi-off" size={13} color="#92400E" />
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      ) : null}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a civic question..."
          placeholderTextColor="#9CA3AF"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => sendMessage(draft)}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!draft.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={() => sendMessage(draft)}
          disabled={!draft.trim() || isLoading}
          activeOpacity={0.8}
        >
          <Feather name="send" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#9CA3AF',
    marginTop: 2,
    fontSize: 12,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  assistantRow: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  userRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexShrink: 0,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#16A34A',
    borderBottomRightRadius: 4,
  },
  typingBubble: {
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  assistantBubbleText: {
    color: '#111827',
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  typingText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#92400E',
    fontSize: 12,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    paddingHorizontal: 18,
    fontSize: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CivicAssistant;
