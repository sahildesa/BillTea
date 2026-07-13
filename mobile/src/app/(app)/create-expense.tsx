import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  MoreVertical,
  Wallet,
  CalendarDays,
  Tag,
  CreditCard,
  FileText,
  Paperclip,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { GlassPanel } from '../../components/ui/GlassPanel';

const CATEGORIES = [
  'Marketing', 'Travel', 'DevOps', 'Office Supplies', 'Utilities', 'Salary', 'Taxes',
];

const PAYMENT_METHODS = [
  'Credit Card', 'Bank Transfer', 'UPI', 'Cash', 'Cheque',
];

function formatDate(date: Date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function CreateExpenseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('');
  const [date] = useState(new Date());
  const [category, setCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handlePickAttachment = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setAttachment(result.assets[0].uri);
    }
  };

  const handleLogExpense = async () => {
    if (!amount || !category) return;
    setSaving(true);
    try {
      // TODO: connect to API to create the expense
      console.log({ amount, date, category, paymentMethod, note, attachment });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.surface + '99',
            borderBottomColor: colors.primary + '1A',
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>Create Expense</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Expense Details */}
        <GlassPanel style={styles.section}>
          <View style={[styles.sectionHeaderRow, { borderBottomColor: colors.primary + '1A' }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '80' }]}>
              <Wallet size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expense Details</Text>
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
            <View
              style={[
                styles.inputWrap,
                { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary + '60'}
                keyboardType="decimal-pad"
                style={[styles.amountInput, { color: colors.primary }]}
              />
            </View>
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
            <View
              style={[
                styles.selectRow,
                { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border },
              ]}
            >
              <CalendarDays size={18} color={colors.primary} />
              <Text style={[styles.selectText, { color: colors.text }]}>{formatDate(date)}</Text>
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
            <TouchableOpacity
              onPress={() => setCategoryModalOpen(true)}
              style={[
                styles.selectRow,
                { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border },
              ]}
            >
              <Tag size={18} color={colors.primary} />
              <Text
                style={[
                  styles.selectText,
                  { color: category ? colors.text : colors.textSecondary, flex: 1 },
                ]}
              >
                {category ?? 'Select Category'}
              </Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Method</Text>
            <TouchableOpacity
              onPress={() => setPaymentModalOpen(true)}
              style={[
                styles.selectRow,
                { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border },
              ]}
            >
              <CreditCard size={18} color={colors.primary} />
              <Text style={[styles.selectText, { color: colors.text, flex: 1 }]}>{paymentMethod}</Text>
              <ChevronDown size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </GlassPanel>

        {/* Payment Note */}
        <GlassPanel style={styles.section}>
          <View style={styles.sectionHeaderRowNoBorder}>
            <View style={[styles.iconCircleSm, { backgroundColor: colors.secondary + '60' }]}>
              <FileText size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Payment Note</Text>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add descriptions or tags here..."
            placeholderTextColor={colors.textSecondary + '80'}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[
              styles.textarea,
              { backgroundColor: colors.surfaceVariant + '80', borderColor: colors.border, color: colors.text },
            ]}
          />
        </GlassPanel>

        {/* Receipt & Attachments */}
        <GlassPanel style={styles.section}>
          <View style={styles.sectionHeaderRowNoBorder}>
            <View style={[styles.iconCircleSm, { backgroundColor: colors.secondary + '60' }]}>
              <Paperclip size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionSubTitle, { color: colors.text }]}>Receipt &amp; Attachments</Text>
          </View>

          <TouchableOpacity
            onPress={handlePickAttachment}
            style={[
              styles.uploadBox,
              { backgroundColor: colors.surfaceVariant + '60', borderColor: colors.primary + '40' },
            ]}
          >
            <View style={[styles.iconCircleSm, { backgroundColor: colors.primary + '1A' }]}>
              <UploadCloud size={18} color={colors.primary} />
            </View>
            <Text style={[styles.uploadText, { color: colors.text }]}>
              {attachment ? 'Receipt attached' : 'Tap to upload receipt or PDF'}
            </Text>
          </TouchableOpacity>
        </GlassPanel>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.surface + 'CC',
            borderTopColor: colors.primary + '1A',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleLogExpense}
          disabled={saving}
          style={[
            styles.logButton,
            { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' },
          ]}
        >
          <CheckCircle2 size={20} color={colors.primary} />
          <Text style={[styles.logButtonText, { color: colors.primary }]}>
            {saving ? 'Logging...' : 'Log Expense'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <SelectModal
        visible={categoryModalOpen}
        title="Select Category"
        options={CATEGORIES}
        selected={category}
        onSelect={(value) => {
          setCategory(value);
          setCategoryModalOpen(false);
        }}
        onClose={() => setCategoryModalOpen(false)}
      />

      {/* Payment Method Modal */}
      <SelectModal
        visible={paymentModalOpen}
        title="Select Payment Method"
        options={PAYMENT_METHODS}
        selected={paymentMethod}
        onSelect={(value) => {
          setPaymentMethod(value);
          setPaymentModalOpen(false);
        }}
        onClose={() => setPaymentModalOpen(false)}
      />
    </View>
  );
}

function SelectModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View
          style={[styles.modalCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{item}</Text>
                {selected === item && <Check size={18} color={colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 64,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  section: { marginBottom: 16, padding: 20 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 20,
  },
  sectionHeaderRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSm: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '600' },
  sectionSubTitle: { fontSize: 14, fontWeight: '600' },
  field: { marginBottom: 18 },
  label: { fontSize: 13, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: { fontSize: 24, marginRight: 8 },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
    padding: 0,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: { fontSize: 15 },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 20,
  },
  uploadText: { fontSize: 13, fontWeight: '500' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
  },
  logButtonText: { fontSize: 17, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: { fontSize: 15 },
});
