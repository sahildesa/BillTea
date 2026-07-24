import React, { useState, useCallback } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, User } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

export default function QuotationSettingsScreen() {
  const router = useRouter();

  const [quotationPrefix, setQuotationPrefix] = useState('QUO');
  const [startingNumber, setStartingNumber] = useState('1');

  const [showHsnCode, setShowHsnCode] = useState(true);
  const [showSku, setShowSku] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(true);
  const [displayPersonalName, setDisplayPersonalName] = useState(false);

  const [topMessage, setTopMessage] = useState('');
  const [bottomMessage, setBottomMessage] = useState('');
  const [terms, setTerms] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Explicitly push to /settings to ensure it never pops back to dashboard
  const goBack = useCallback(() => {
    router.push('/settings');
  }, [router]);

  // Intercept physical hardware back button and swipe gestures on mobile
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true;
      });
      return () => subscription.remove();
    }, [goBack])
  );

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSaveConfiguration = () => {
    const prefix = quotationPrefix.trim();
    const number = Number(startingNumber);

    clearMessages();

    if (!prefix) {
      setErrorMessage('Quotation prefix is required.');
      return;
    }

    if (!startingNumber.trim() || Number.isNaN(number) || number <= 0) {
      setErrorMessage('Starting number must be greater than 0.');
      return;
    }

    const configuration = {
      quotationPrefix: prefix,
      startingNumber: number,
      showHsnCode,
      showSku,
      showPaymentMethod,
      displayPersonalName,
      topMessage: topMessage.trim(),
      bottomMessage: bottomMessage.trim(),
      terms: terms.trim(),
    };

    console.log('Quotation configuration:', configuration);

    setSuccessMessage('Configuration saved successfully.');

    setTimeout(() => {
      setSuccessMessage('');
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.header}>
          <Pressable
            onPress={goBack}
            hitSlop={12}
            style={styles.headerIconButton}
          >
            <ArrowLeft size={24} color={COLORS.primary} />
          </Pressable>

          <Text style={styles.headerTitle}>Quotation Settings</Text>

          <View style={styles.profileButton}>
            <User size={18} color={COLORS.primary} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.content}>
            <SectionTitle title="General Configuration" />

            <View style={styles.card}>
              <InputField
                label="Quotation Prefix"
                value={quotationPrefix}
                onChangeText={value => {
                  clearMessages();
                  setQuotationPrefix(value.toUpperCase());
                }}
                placeholder="Enter quotation prefix"
              />

              <InputField
                label="Starting Number"
                value={startingNumber}
                onChangeText={value => {
                  clearMessages();
                  setStartingNumber(value.replace(/[^0-9]/g, ''));
                }}
                placeholder="Enter starting number"
                keyboardType="number-pad"
                isLast
              />
            </View>

            <SectionTitle
              title="Display Preferences"
              description="When enabled, selected fields will appear in quotation line items, print view, and PDF."
            />

            <View style={styles.card}>
              <PreferenceSwitch
                label="Show HSN Code in quotation"
                value={showHsnCode}
                onValueChange={setShowHsnCode}
              />

              <Divider />

              <PreferenceSwitch
                label="Show SKU in quotation"
                value={showSku}
                onValueChange={setShowSku}
              />

              <Divider />

              <PreferenceSwitch
                label="Show Payment Method in quotation"
                value={showPaymentMethod}
                onValueChange={setShowPaymentMethod}
              />

              <Divider />

              <PreferenceSwitch
                label="Display Personal Name"
                value={displayPersonalName}
                onValueChange={setDisplayPersonalName}
              />
            </View>

            <SectionTitle title="Messaging" />

            <View style={styles.card}>
              <MultilineInput
                label="Top Message"
                value={topMessage}
                onChangeText={value => {
                  clearMessages();
                  setTopMessage(value);
                }}
                placeholder="Add a custom message to appear at the top..."
              />

              <MultilineInput
                label="Bottom Message"
                value={bottomMessage}
                onChangeText={value => {
                  clearMessages();
                  setBottomMessage(value);
                }}
                placeholder="Add a custom message to appear at the bottom..."
                isLast
              />
            </View>

            <SectionTitle title="Legal" />

            <View style={styles.card}>
              <MultilineInput
                label="Terms & Conditions"
                value={terms}
                onChangeText={value => {
                  clearMessages();
                  setTerms(value);
                }}
                placeholder="Enter terms and conditions for quotations..."
                height={120}
                isLast
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSaveConfiguration}
              style={styles.saveButton}
            >
              <Save size={18} color={COLORS.primary} />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type SectionTitleProps = {
  title: string;
  description?: string;
};

function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {description ? (
        <Text style={styles.sectionDescription}>{description}</Text>
      ) : null}
    </View>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  isLast?: boolean;
  onChangeText: (value: string) => void;
};

function InputField({
  label,
  value,
  placeholder,
  keyboardType = 'default',
  isLast = false,
  onChangeText,
}: InputFieldProps) {
  return (
    <View style={[styles.inputGroup, isLast && styles.lastInputGroup]}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

type MultilineInputProps = {
  label: string;
  value: string;
  placeholder: string;
  height?: number;
  isLast?: boolean;
  onChangeText: (value: string) => void;
};

function MultilineInput({
  label,
  value,
  placeholder,
  height = 90,
  isLast = false,
  onChangeText,
}: MultilineInputProps) {
  return (
    <View style={[styles.inputGroup, isLast && styles.lastInputGroup]}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        multiline
        textAlignVertical="top"
        style={[styles.input, styles.textArea, { height }]}
      />
    </View>
  );
}

type PreferenceSwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PreferenceSwitch({
  label,
  value,
  onValueChange,
}: PreferenceSwitchProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: COLORS.switchOffTrack,
          true: COLORS.switchOnTrack,
        }}
        thumbColor={value ? COLORS.primary : COLORS.switchThumb}
        ios_backgroundColor={COLORS.switchOffTrack}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const COLORS = {
  background: '#07101F',
  header: '#0B1424',
  card: '#10192B',
  input: '#0B1424',
  border: 'rgba(148,163,184,0.22)',
  divider: 'rgba(148,163,184,0.12)',
  primary: '#67E8F9',
  text: '#F8FAFC',
  muted: '#94A3B8',
  placeholder: '#64748B',
  success: '#86EFAC',
  successBg: 'rgba(34,197,94,0.10)',
  successBorder: 'rgba(34,197,94,0.25)',
  error: '#FCA5A5',
  errorBg: 'rgba(239,68,68,0.10)',
  errorBorder: 'rgba(239,68,68,0.25)',
  switchOnTrack: 'rgba(103,232,249,0.35)',
  switchOffTrack: '#CBD5E1',
  switchThumb: '#94A3B8',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.header,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },

  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(103,232,249,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.18)',
  },

  scrollContent: {
    paddingBottom: 170,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  sectionHeader: {
    marginBottom: 14,
    marginTop: 8,
  },

  sectionTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 8,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
  },

  inputGroup: {
    marginBottom: 20,
  },

  lastInputGroup: {
    marginBottom: 0,
  },

  label: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.input,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  textArea: {
    fontWeight: '600',
    lineHeight: 22,
  },

  switchRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  switchLabel: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    paddingRight: 16,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },

  errorBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    marginBottom: 18,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  successBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    marginBottom: 18,
  },

  successText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  saveButton: {
    height: 58,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.45)',
    backgroundColor: 'rgba(103,232,249,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },

  saveButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
});