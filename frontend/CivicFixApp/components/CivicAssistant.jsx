import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const starterMessages = [
  {
    id: '1',
    role: 'assistant',
    text: 'Ask about civic complaints, RTI, local authority duties, public nuisance, or your basic civic rights. I provide general guidance, not formal legal advice.',
  },
];
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const getFallbackReply = (question) => {
  const normalized = question.toLowerCase();

  if (normalized.includes('rti')) {
    return 'You can usually use RTI to ask a public authority for records, status updates, action taken reports, and related official information.';
  }

  if (normalized.includes('garbage') || normalized.includes('waste') || normalized.includes('sanitation')) {
    return 'For sanitation complaints, keep photos, exact location details, and dates. Report first to the local municipal body and escalate with evidence if the issue continues.';
  }

  if (normalized.includes('road') || normalized.includes('pothole')) {
    return 'For road or pothole complaints, record the exact location, risk to the public, and any repeat incidents. Clear documentation usually helps escalation.';
  }

  if (normalized.includes('water') || normalized.includes('drainage')) {
    return 'For water or drainage issues, document service disruption, impact on residents, and any health risk. A written complaint with evidence is usually the best first step.';
  }

  return 'I could not reach the live civic guidance service right now, but I can still offer basic general help. Try asking about RTI, sanitation, roads, drainage, or civic complaint escalation.';
};

const CivicAssistant = ({ user }) => {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const displayName = useMemo(() => {
    if (user?.name) {
      return user.name;
    }

    if (user?.email) {
      return user.email.split('@')[0];
    }

    return 'Citizen';
  }, [user]);

  const handleSend = async () => {
    if (!draft.trim()) {
      return;
    }

    const trimmedDraft = draft.trim();
    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmedDraft,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setErrorText('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedDraft,
          history: messages.map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to get a response from CivicBot.');
      }

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: result.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackMessage = {
        id: `${Date.now()}-assistant-fallback`,
        role: 'assistant',
        text: getFallbackReply(trimmedDraft),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
      setErrorText(
        error?.message?.includes('fetch')
          ? 'Live CivicBot is unreachable right now. Showing offline guidance.'
          : error.message || 'Unable to get a response from CivicBot.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="robot-outline" size={24} color="#000000" />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>CivicBot</Text>
          <Text style={styles.subtitle}>
            Plain-language help for civic complaints, rights, RTI, and local rules for {displayName}.
          </Text>
          <Text style={styles.disclaimer}>
            General guidance only, not a substitute for a lawyer or official legal advice.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                message.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}

        {isLoading ? (
          <View style={[styles.bubble, styles.assistantBubble]}>
            <Text style={[styles.bubbleText, styles.assistantBubbleText]}>
              CivicBot is thinking...
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about civic laws, duties, rights..."
          placeholderTextColor="#71717A"
          value={draft}
          onChangeText={setDraft}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isLoading}>
          <MaterialCommunityIcons name="send" size={18} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  subtitle: {
    color: '#A3A3A3',
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
  },
  disclaimer: {
    color: '#71717A',
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 12,
    gap: 10,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#090909',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  assistantBubbleText: {
    color: '#FFFFFF',
  },
  userBubbleText: {
    color: '#000000',
  },
  inputRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: '#090909',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginRight: 10,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CivicAssistant;
