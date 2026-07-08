import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { AppHeader } from '../../../components/ui/AppHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INVOICE_PLACEHOLDERS = [
  '{customer_name}', '{company_name}', '{invoice_number}', '{invoice_date}',
  '{total_amount}', '{items}', '{attachment_url}', '{thank_you}',
];

const QUOTATION_PLACEHOLDERS = [
  '{customer_name}', '{company_name}', '{quotation_number}',
  '{quotation_date}', '{total_amount}', '{valid_until}',
];

const DEFAULT_INVOICE_TEMPLATE = `Hello {customer_name},

Please find your invoice from {company_name} with invoice number {invoice_number} attached.

Invoice Date: {invoice_date}
Total Amount: {total_amount}

{items}`;

const SHORT_INVOICE_TEMPLATE = `Hi {customer_name}, your invoice {invoice_number} from {company_name} is attached. Total: {total_amount}.`;

const DEFAULT_QUOTATION_TEMPLATE = `Hello {customer_name},

Here is your quotation from {company_name}.
Quotation Number: {quotation_number}
Total Amount: {total_amount}`;

const QUICK_TEMPLATE_OPTIONS = ['Default', 'Short Version', 'With Item Details'] as const;
type QuickTemplateOption = typeof QUICK_TEMPLATE_OPTIONS[number];

export default function WhatsappSettingsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [instanceId, setInstanceId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [invoiceTemplate, setInvoiceTemplate] = useState(DEFAULT_INVOICE_TEMPLATE);
  const [quotationTemplate, setQuotationTemplate] = useState(DEFAULT_QUOTATION_TEMPLATE);
  const [quickTemplate, setQuickTemplate] = useState<QuickTemplateOption>('Default');

  const handleQuickTemplateChange = (option: QuickTemplateOption) => {
    setQuickTemplate(option);
    if (option === 'Short Version') setInvoiceTemplate(SHORT_INVOICE_TEMPLATE);
    if (option === 'With Item Details') setInvoiceTemplate(DEFAULT_INVOICE_TEMPLATE);
  };

  const insertChip = (
    chip: string,
    current: string,
    setValue: (v: string) => void
  ) => {
    setValue(current.length > 0 ? `${current} ${chip}` : chip);
  };

  const handleSave = () => {
    // TODO: connect to API to persist WhatsApp settings for this branch
    console.log({ instanceId, accessToken, invoiceTemplate, quotationTemplate });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={isDark ? ['#081326', '#111b2f'] : [colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <AppHeader title="WhatsApp Settings" />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 24, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>WhatsApp API Credentials</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            If you want to send messages from your own number, add your credentials for this branch (Main Branch).
            If left empty, messages will be sent using the system default number configured in the application.
          </Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>WHATSAPP INSTANCE ID</Text>
            <TextInput
              value={instanceId}
              onChangeText={setInstanceId}
              placeholder="Enter instance ID"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border, color: colors.text }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>WHATSAPP ACCESS TOKEN</Text>
            <TextInput
              value={accessToken}
              onChangeText={setAccessToken}
              placeholder="Enter access token"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={[styles.input, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border, color: colors.text }]}
            />
          </View>
        </GlassPanel>

        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Invoice WhatsApp Message Template</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            You can customize the WhatsApp message sent with invoices for this branch. If you leave it empty,
            the system default message will be used.
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>CLICK TO INSERT PLACEHOLDERS</Text>
          <View style={styles.chipRow}>
            {INVOICE_PLACEHOLDERS.map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => insertChip(chip, invoiceTemplate, setInvoiceTemplate)}
                style={[styles.chip, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border }]}
              >
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>QUICK TEMPLATES</Text>
          <SegmentedControl<QuickTemplateOption>
            options={QUICK_TEMPLATE_OPTIONS as unknown as QuickTemplateOption[]}
            activeOption={quickTemplate}
            onOptionChange={handleQuickTemplateChange}
          />

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>TEMPLATE</Text>
            <TextInput
              value={invoiceTemplate}
              onChangeText={setInvoiceTemplate}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={[styles.textarea, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border, color: colors.text }]}
            />
          </View>
        </GlassPanel>

        <GlassPanel style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Quotation WhatsApp Message Template</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            You can customize the WhatsApp message sent with quotations for this branch. If you leave it empty,
            the system default message will be used.
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary, marginBottom: 8 }]}>CLICK TO INSERT PLACEHOLDERS</Text>
          <View style={styles.chipRow}>
            {QUOTATION_PLACEHOLDERS.map((chip) => (
              <TouchableOpacity
                key={chip}
                onPress={() => insertChip(chip, quotationTemplate, setQuotationTemplate)}
                style={[styles.chip, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border }]}
              >
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>TEMPLATE</Text>
            <TextInput
              value={quotationTemplate}
              onChangeText={setQuotationTemplate}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.textarea, { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border, color: colors.text }]}
            />
          </View>
        </GlassPanel>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '4D' }]}
        >
          <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 6 },
  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  textarea: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, minHeight: 120 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '500' },
  saveButton: { borderWidth: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
});