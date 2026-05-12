import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const normalizeImages = (images = []) =>
  images
    .map((image) => {
      if (typeof image === 'string') return { uri: image };
      if (image?.uri) return image;
      if (image?.file_url) return { ...image, uri: image.file_url };
      return null;
    })
    .filter((image) => Boolean(image?.uri));

const stopPress = (event, callback) => {
  event?.stopPropagation?.();
  callback?.();
};

const ImageCarousel = ({
  images = [],
  height = 180,
  borderRadius = 0,
  resizeMode = 'cover',
  showRemove = false,
  onRemove,
}) => {
  const normalizedImages = useMemo(() => normalizeImages(images), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef(null);

  if (!normalizedImages.length) return null;

  const lastIndex = normalizedImages.length - 1;
  const canPage = normalizedImages.length > 1 && width > 0;
  const visibleIndex = Math.min(activeIndex, lastIndex);

  useEffect(() => {
    if (activeIndex > lastIndex) {
      setActiveIndex(lastIndex);
      if (width > 0) {
        scrollRef.current?.scrollTo({ x: lastIndex * width, animated: false });
      }
    }
  }, [activeIndex, lastIndex, width]);

  const scrollToIndex = (index) => {
    if (!canPage) return;
    const nextIndex = Math.max(0, Math.min(lastIndex, index));
    setActiveIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
  };

  const handleMomentumEnd = (event) => {
    if (!width) return;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(lastIndex, nextIndex)));
  };

  return (
    <View
      style={[styles.shell, { height, borderRadius }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.scroller}
      >
        {normalizedImages.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={[styles.slide, { width: width || 1, height }]}>
            <Image source={{ uri: image.uri }} style={styles.image} resizeMode={resizeMode} />
            {showRemove ? (
              <TouchableOpacity
                style={styles.removeButton}
                activeOpacity={0.8}
                onPress={(event) => stopPress(event, () => onRemove?.(image.uri))}
              >
                <Feather name="x" size={14} color="#FFFFFF" />
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>

      {normalizedImages.length > 1 ? (
        <>
          <View style={styles.counter}>
            <Text style={styles.counterText}>{visibleIndex + 1}/{normalizedImages.length}</Text>
          </View>

          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowLeft, visibleIndex === 0 && styles.arrowDisabled]}
            activeOpacity={0.8}
            disabled={visibleIndex === 0}
            onPress={(event) => stopPress(event, () => scrollToIndex(visibleIndex - 1))}
          >
            <Feather name="chevron-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, styles.arrowRight, visibleIndex === lastIndex && styles.arrowDisabled]}
            activeOpacity={0.8}
            disabled={visibleIndex === lastIndex}
            onPress={(event) => stopPress(event, () => scrollToIndex(visibleIndex + 1))}
          >
            <Feather name="chevron-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.dots}>
            {normalizedImages.map((image, index) => (
              <View
                key={`${image.uri}-dot-${index}`}
                style={[styles.dot, index === visibleIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  scroller: {
    flex: 1,
  },
  slide: {
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    width: 30,
    height: 30,
    marginTop: -15,
    borderRadius: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  arrowDisabled: {
    opacity: 0.28,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default ImageCarousel;
