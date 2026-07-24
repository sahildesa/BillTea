import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

const OFFICE_LOCATION = {
  title: 'Indux Tech HQ',
  addressLine1: 'Pune, Maharashtra',
  addressLine2: 'India',
  addressLine3: 'Temporary location - update with real office address',
  latitude: 18.5204,
  longitude: 73.8567,
};

const supportOptions = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Support',
    subtitle: '+91 98765 43210',
    iconType: 'ion',
    iconName: 'logo-whatsapp',
    accent: 'success',
    url: 'https://wa.me/919876543210',
  },
  {
    id: 'call',
    title: 'Call Center',
    subtitle: 'Available 24/7',
    iconType: 'material',
    iconName: 'headset',
    accent: 'purple',
    url: 'tel:+919876543210',
  },
] as const;

const faqItems = [
  {
    question: 'How to generate a new invoice?',
    answer:
      'Go to the Invoice section, tap Create Invoice, add customer and item details, then save or share the invoice.',
  },
  {
    question: 'Can I export my reports to Excel?',
    answer:
      'Yes, reports can be exported using the export option from the Reports section if your plan supports it.',
  },
  {
    question: 'How to manage multiple branches?',
    answer:
      'You can manage branch details from Settings. Add branch information and switch between branches when required.',
  },
  {
    question: 'Updating my premium subscription',
    answer:
      'You can update or renew your subscription from the Plan & Subscription section inside Settings.',
  },
  {
    question: 'How do I add a new customer?',
    answer:
      'Open the Customers section, tap Add Customer, enter the required details, and save the customer profile.',
  },
  {
    question: 'Can I share invoice on WhatsApp?',
    answer:
      'Yes, after generating an invoice, use the share option and select WhatsApp to send it to the customer.',
  },
  {
    question: 'How do I change business details?',
    answer:
      'Business details can be updated from Profile or Business Settings depending on your account permissions.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can contact support using WhatsApp Support, Call Center, or the Get Directions option for office visit.',
  },
];

export default function HelpSupportScreen() {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const theme = useMemo(() => getThemeTokens(isDark), [isDark]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [searchText, setSearchText] = useState('');
  const [openedFaq, setOpenedFaq] = useState<string | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Unified navigation function to reliably return to settings
  const goBack = useCallback(() => {
    router.push('/settings');
  }, []);

  // Intercept Android hardware/gesture back buttons while this screen is focused
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true; // Prevents default stack behavior (going straight to dashboard)
      });
      return () => subscription.remove();
    }, [goBack])
  );

  const filteredFaqs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const list = showAllFaqs ? faqItems : faqItems.slice(0, 4);

    if (!query) {
      return list;
    }

    return faqItems.filter(
      item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query),
    );
  }, [searchText, showAllFaqs]);

  const openUrl = useCallback(async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn('Unable to open URL:', error);
    }
  }, []);

  const handleDirections = useCallback(() => {
    const { latitude, longitude, title } = OFFICE_LOCATION;

    const mapUrl =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodeURIComponent(
            title,
          )}`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    openUrl(mapUrl);
  }, [openUrl]);

  const handleToggleFaq = useCallback((question: string) => {
    setOpenedFaq(previous => (previous === question ? null : question));
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 170 },
        ]}
      >
        <SectionTitle title="DIRECT SUPPORT" styles={styles} />

        <View style={styles.supportList}>
          {supportOptions.map(item => (
            <SupportCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              iconType={item.iconType}
              iconName={item.iconName}
              accentColor={theme.colors[item.accent]}
              onPress={() => openUrl(item.url)}
              styles={styles}
              theme={theme}
            />
          ))}
        </View>

        <SectionTitle title="OFFICE LOCATION" styles={styles} />

        <LocationCard
          styles={styles}
          theme={theme}
          onDirectionsPress={handleDirections}
        />

        <View style={styles.faqTitleWrapper}>
          <SectionTitle title="FREQUENTLY ASKED QUESTIONS" styles={styles} />

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.colors.mutedText}
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search topics..."
              placeholderTextColor={theme.colors.mutedText}
              style={styles.searchInput}
              cursorColor={theme.colors.primary}
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.faqList}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(item => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openedFaq === item.question}
                onPress={() => handleToggleFaq(item.question)}
                styles={styles}
                theme={theme}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No matching questions found.</Text>
          )}
        </View>

        {!searchText.trim() ? (
          <Pressable
            onPress={() => setShowAllFaqs(previous => !previous)}
            style={({ pressed }) => [
              styles.viewAllButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>
              {showAllFaqs ? 'Show less' : 'View all 24 questions'}
            </Text>
            <Ionicons
              name={showAllFaqs ? 'chevron-up' : 'arrow-forward'}
              size={16}
              color={theme.colors.primary}
            />
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionTitle = memo(
  ({
    title,
    styles,
  }: {
    title: string;
    styles: ReturnType<typeof createStyles>;
  }) => {
    return <Text style={styles.sectionTitle}>{title}</Text>;
  },
);

const SupportCard = memo(
  ({
    title,
    subtitle,
    iconType,
    iconName,
    accentColor,
    onPress,
    styles,
    theme,
  }: {
    title: string;
    subtitle: string;
    iconType: 'ion' | 'material';
    iconName: string;
    accentColor: string;
    onPress: () => void;
    styles: ReturnType<typeof createStyles>;
    theme: ThemeTokens;
  }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.supportCard,
          pressed && styles.pressedCard,
        ]}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: withOpacity(accentColor, 0.12),
              borderColor: withOpacity(accentColor, 0.35),
            },
          ]}
        >
          {iconType === 'ion' ? (
            <Ionicons
              name={iconName as React.ComponentProps<typeof Ionicons>['name']}
              size={24}
              color={accentColor}
            />
          ) : (
            <MaterialCommunityIcons
              name={
                iconName as React.ComponentProps<
                  typeof MaterialCommunityIcons
                >['name']
              }
              size={25}
              color={accentColor}
            />
          )}
        </View>

        <View style={styles.supportTextWrapper}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={24}
          color={theme.colors.secondaryText}
        />
      </Pressable>
    );
  },
);

const MapPreview = memo(
  ({
    styles,
    theme,
  }: {
    styles: ReturnType<typeof createStyles>;
    theme: ThemeTokens;
  }) => {
    return (
      <View style={styles.mapPreview}>
        <View style={[styles.mapRoad, styles.mapRoadOne]} />
        <View style={[styles.mapRoad, styles.mapRoadTwo]} />
        <View style={[styles.mapRoad, styles.mapRoadThree]} />

        <View style={[styles.mapRoadThin, styles.mapRoadFour]} />
        <View style={[styles.mapRoadThin, styles.mapRoadFive]} />
        <View style={[styles.mapRoadThin, styles.mapRoadSix]} />

        <View style={styles.mapPin}>
          <Ionicons name="location" size={24} color={theme.colors.background} />
        </View>

        <Text style={styles.mapLabel}>Pune</Text>
        <Text style={styles.mapSmallLabel}>Maharashtra</Text>
        <Text style={styles.mapPreviewText}>Location preview</Text>
      </View>
    );
  },
);

const LocationCard = memo(
  ({
    styles,
    theme,
    onDirectionsPress,
  }: {
    styles: ReturnType<typeof createStyles>;
    theme: ThemeTokens;
    onDirectionsPress: () => void;
  }) => {
    return (
      <View style={styles.locationCard}>
        <MapPreview styles={styles} theme={theme} />

        <View style={styles.locationContent}>
          <View style={styles.locationIconWrapper}>
            <Ionicons name="location" size={23} color={theme.colors.primary} />
          </View>

          <View style={styles.locationTextWrapper}>
            <Text style={styles.locationTitle}>{OFFICE_LOCATION.title}</Text>
            <Text style={styles.locationAddress}>
              {OFFICE_LOCATION.addressLine1}
            </Text>
            <Text style={styles.locationAddress}>
              {OFFICE_LOCATION.addressLine2}
            </Text>
            <Text style={styles.locationAddress}>
              {OFFICE_LOCATION.addressLine3}
            </Text>

            <Pressable
              onPress={onDirectionsPress}
              style={({ pressed }) => [
                styles.directionButton,
                pressed && styles.pressedCard,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.directionButtonText}>Get Directions</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  },
);

const FaqItem = memo(
  ({
    question,
    answer,
    isOpen,
    onPress,
    styles,
    theme,
  }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onPress: () => void;
    styles: ReturnType<typeof createStyles>;
    theme: ThemeTokens;
  }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.faqItem, pressed && styles.pressedCard]}
        accessibilityRole="button"
      >
        <View style={styles.faqQuestionRow}>
          <Text style={styles.faqQuestion}>{question}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.secondaryText}
          />
        </View>

        {isOpen ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
      </Pressable>
    );
  },
);

type ThemeTokens = ReturnType<typeof getThemeTokens>;

function getThemeTokens(isDark: boolean) {
  return {
    colors: {
      background: isDark ? '#070C18' : '#F8FAFC',
      surface: isDark ? '#0B1220' : '#FFFFFF',
      surfaceSoft: isDark ? '#111827' : '#F1F5F9',
      border: isDark ? '#1E2A3A' : '#E2E8F0',
      text: isDark ? '#F8FAFC' : '#0F172A',
      secondaryText: isDark ? '#A7B4C6' : '#64748B',
      mutedText: isDark ? '#7F8EA3' : '#94A3B8',
      primary: '#38BDF8',
      success: '#22C55E',
      purple: '#A855F7',
      mapBackground: isDark ? '#172235' : '#DDEAF4',
      mapRoad: isDark ? '#334155' : '#B8C7D9',
      mapRoadLight: isDark ? '#475569' : '#EEF4FA',
      mapText: isDark ? '#CBD5E1' : '#475569',
    },
    spacing: {
      xs: 6,
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    radius: {
      md: 14,
      lg: 20,
      xl: 24,
      pill: 999,
    },
    fontSize: {
      xs: 12,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 24,
    },
  };
}

function createStyles(theme: ThemeTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      minHeight: 58,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
    },
    headerTitle: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: '800',
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    sectionTitle: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.sm,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: theme.spacing.md,
      textTransform: 'uppercase',
    },
    supportList: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    supportCard: {
      minHeight: 82,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconCircle: {
      height: 52,
      width: 52,
      borderRadius: 26,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    supportTextWrapper: {
      flex: 1,
    },
    cardTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      fontWeight: '800',
    },
    cardSubtitle: {
      color: theme.colors.secondaryText,
      fontSize: theme.fontSize.sm,
      marginTop: 4,
    },
    locationCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: theme.spacing.xxl,
    },
    mapPreview: {
      width: '100%',
      height: 175,
      backgroundColor: theme.colors.mapBackground,
      overflow: 'hidden',
      position: 'relative',
    },
    mapRoad: {
      position: 'absolute',
      height: 10,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.mapRoad,
    },
    mapRoadThin: {
      position: 'absolute',
      height: 5,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.mapRoadLight,
    },
    mapRoadOne: {
      width: 320,
      left: -40,
      top: 45,
      transform: [{ rotate: '18deg' }],
    },
    mapRoadTwo: {
      width: 360,
      right: -70,
      top: 95,
      transform: [{ rotate: '-20deg' }],
    },
    mapRoadThree: {
      width: 260,
      left: 90,
      top: 135,
      transform: [{ rotate: '8deg' }],
    },
    mapRoadFour: {
      width: 250,
      left: -30,
      top: 120,
      transform: [{ rotate: '-35deg' }],
    },
    mapRoadFive: {
      width: 220,
      right: -20,
      top: 35,
      transform: [{ rotate: '42deg' }],
    },
    mapRoadSix: {
      width: 190,
      left: 40,
      top: 82,
      transform: [{ rotate: '-8deg' }],
    },
    mapPin: {
      position: 'absolute',
      top: 62,
      left: '50%',
      marginLeft: -23,
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: withOpacity(theme.colors.background, 0.8),
    },
    mapLabel: {
      position: 'absolute',
      top: 115,
      alignSelf: 'center',
      color: theme.colors.mapText,
      fontSize: theme.fontSize.md,
      fontWeight: '800',
    },
    mapSmallLabel: {
      position: 'absolute',
      top: 138,
      alignSelf: 'center',
      color: theme.colors.mapText,
      fontSize: theme.fontSize.xs,
      fontWeight: '600',
    },
    mapPreviewText: {
      position: 'absolute',
      left: theme.spacing.md,
      bottom: theme.spacing.sm,
      color: theme.colors.mapText,
      fontSize: theme.fontSize.xs,
      fontWeight: '700',
    },
    locationContent: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    locationIconWrapper: {
      marginTop: 2,
    },
    locationTextWrapper: {
      flex: 1,
    },
    locationTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSize.lg,
      fontWeight: '800',
      marginBottom: theme.spacing.sm,
    },
    locationAddress: {
      color: theme.colors.secondaryText,
      fontSize: theme.fontSize.sm,
      lineHeight: 21,
    },
    directionButton: {
      alignSelf: 'flex-start',
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
      backgroundColor: withOpacity(theme.colors.primary, 0.12),
      borderWidth: 1,
      borderColor: withOpacity(theme.colors.primary, 0.35),
    },
    directionButtonText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.sm,
      fontWeight: '800',
    },
    faqTitleWrapper: {
      marginTop: theme.spacing.xs,
    },
    searchBox: {
      height: 44,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.sm,
      paddingVertical: 0,
    },
    faqList: {
      gap: theme.spacing.md,
    },
    faqItem: {
      padding: theme.spacing.lg,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    faqQuestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    faqQuestion: {
      flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
      fontWeight: '700',
      lineHeight: 21,
    },
    faqAnswer: {
      color: theme.colors.secondaryText,
      fontSize: theme.fontSize.sm,
      lineHeight: 21,
      marginTop: theme.spacing.md,
    },
    emptyText: {
      color: theme.colors.secondaryText,
      fontSize: theme.fontSize.sm,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    viewAllButton: {
      marginTop: theme.spacing.xl,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    viewAllText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.sm,
      fontWeight: '800',
    },
    pressed: {
      opacity: 0.7,
    },
    pressedCard: {
      opacity: 0.82,
      transform: [{ scale: 0.995 }],
    },
  });
}

function withOpacity(hexColor: string, opacity: number) {
  const hex = hexColor.replace('#', '');

  if (hex.length !== 6) {
    return hexColor;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}