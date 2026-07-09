import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  MoreVertical, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Calendar, 
  Send,
  ChevronDown
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface LineItem {
  id: string;
  productName: string;
  description: string;
  unitPrice: number;
  quantity: number;
  image?: string;
}

const MOCK_CLIENTS = [
  "Aurora Tech Solutions",
  "Indux Tech Ltd",
  "BillTea Global Corp",
  "Global Cyber Sec",
  "Google DeepMind"
];

export default function CreateQuotationScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // --- STATE DEFINITIONS ---
  
  // Section 1: Customer Details
  const [selectedClient, setSelectedClient] = useState("Aurora Tech Solutions");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [contactName, setContactName] = useState("Elena Rostova");
  const [mobile, setMobile] = useState("+1 555-0198");
  const [email, setEmail] = useState("elena@aurora.com");
  const [billingAddress, setBillingAddress] = useState("1200 Innovation Drive, Suite 400\nSan Francisco, CA 94103");
  const [shippingIsDifferent, setShippingIsDifferent] = useState(false);

  // Section 2: Discount & Tax Logic
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [discountValue, setDiscountValue] = useState("100.00");
  const [taxLogic, setTaxLogic] = useState<"FIXED_SLAB" | "PER_PRODUCT">("PER_PRODUCT");
  const [taxPercentage, setTaxPercentage] = useState("8"); // Default 8%

  // Section 3: Line Items (Dynamic List)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "item-1",
      productName: "Enterprise Core Switch X1",
      description: "High-throughput layer 3 managed switch with 48 PoE+ ports.",
      unitPrice: 1250.00,
      quantity: 2,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3T8X1oRce8JH4fG8sbWwCfhdnpnKUaCOTsO6LYN-51T1iJNi_g5j47AZuA4aOS6RsTSiiJzBpNrRDH0GbHm3uDd9Jw7GCkCgzuePZKi4AbdtqElcDX1J1JzYGVpwbpIOInTL7-9uo_Fzytc_bdQXK76xhU3FcqHahursrQQcRTsABNZJb7whKr8k4fxId2cE5s0YRxjCD7LQFbuN54ZF6d9YmZNWPCUM7YgrUILH-D-ASjFOI07Kd"
    }
  ]);

  // Section 5: Timeline & Terms
  const [quotationDate, setQuotationDate] = useState("Oct 24, 2023");
  const [validUntil, setValidUntil] = useState("Dec 24, 2023");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due within 30 days. Standard warranty applies to all hardware items.");

  // --- HANDLERS ---
  
  const handleAddNewCustomer = () => {
    setContactName("");
    setMobile("");
    setEmail("");
    setBillingAddress("");
    setSelectedClient("New Client");
    Alert.alert("New Customer", "Form cleared. Please enter details for the new customer.");
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      productName: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    if (lineItems.length === 1) {
      Alert.alert("Warning", "A quotation must have at least one line item.");
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDuplicate = lineItems.find(item => item.id === id);
    if (itemToDuplicate) {
      const duplicatedItem: LineItem = {
        ...itemToDuplicate,
        id: `item-${Date.now()}`,
      };
      const index = lineItems.findIndex(item => item.id === id);
      const updated = [...lineItems];
      updated.splice(index + 1, 0, duplicatedItem);
      setLineItems(updated);
    }
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        let parsedVal = value;
        if (field === 'unitPrice' || field === 'quantity') {
          parsedVal = value === '' ? 0 : parseFloat(value);
          if (isNaN(parsedVal)) parsedVal = 0;
        }
        return { ...item, [field]: parsedVal };
      }
      return item;
    }));
  };

  // --- CALCULATION LOGIC ---
  
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === "FIXED") {
      return Math.min(value, subtotal);
    } else {
      return subtotal * (value / 100);
    }
  }, [subtotal, discountType, discountValue]);

  const taxAmount = useMemo(() => {
    const percentage = parseFloat(taxPercentage) || 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    
    if (taxLogic === "PER_PRODUCT") {
      return taxableAmount * (percentage / 100);
    } else {
      return 192.00;
    }
  }, [subtotal, discountAmount, taxLogic, taxPercentage]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const handleCreateQuotation = () => {
    Alert.alert(
      "Quotation Created",
      `Quotation for ${selectedClient} has been created successfully!\n\nGrand Total: $${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const selectClientFromDropdown = (client: string) => {
    setSelectedClient(client);
    setShowClientDropdown(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? ['#081326', '#111b2f'] : [colors.background, colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Background Glow Blobs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.glowCircle1, { backgroundColor: colors.primary, opacity: isDark ? 0.08 : 0.03 }]} />
        <View style={[styles.glowCircle2, { backgroundColor: colors.tertiary, opacity: isDark ? 0.08 : 0.03 }]} />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.glassBorder }]}>
        <BlurView intensity={70} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassBackground }]} />
        
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.headerBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '33' }]}
            activeOpacity={0.7}
          >
            <ArrowLeft color={colors.primary} size={18} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>New Quotation</Text>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '33' }]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Actions", "Extra settings menu placeholder.")}
          >
            <MoreVertical color={colors.primary} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Canvas ScrollView */}
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { 
            paddingTop: insets.top + 72, 
            paddingBottom: insets.bottom + 140 
          }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* 1. Customer Details Section */}
        <GlassPanel style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Customer Details</Text>
            <TouchableOpacity 
              style={styles.addNewBtn} 
              activeOpacity={0.7}
              onPress={handleAddNewCustomer}
            >
              <Plus color={colors.secondary} size={14} style={{ marginRight: 2 }} />
              <Text style={[styles.addNewText, { color: colors.secondary }]}>Add New</Text>
            </TouchableOpacity>
          </View>

          {/* Searchable Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={[styles.dropdownTrigger, { backgroundColor: colors.background + '66', borderColor: colors.border }]} 
              activeOpacity={0.8}
              onPress={() => setShowClientDropdown(!showClientDropdown)}
            >
              <Search color={colors.textSecondary} size={16} style={styles.dropdownSearchIcon} />
              <Text style={[styles.dropdownTriggerText, { color: colors.text }]}>{selectedClient}</Text>
              <ChevronDown color={colors.textSecondary} size={18} />
            </TouchableOpacity>
            
            {showClientDropdown && (
              <View style={[styles.dropdownList, { backgroundColor: colors.surfaceVariant, borderColor: colors.glassBorder }]}>
                {MOCK_CLIENTS.map((client) => (
                  <TouchableOpacity 
                    key={client} 
                    style={[styles.dropdownItem, { borderBottomColor: colors.border + '33' }]}
                    onPress={() => selectClientFromDropdown(client)}
                  >
                    <Text style={[styles.dropdownItemText, { color: colors.text }]}>{client}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Contact Name</Text>
              <TextInput 
                value={contactName}
                onChangeText={setContactName}
                style={[styles.inputGlass, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                placeholder="Elena Rostova"
                placeholderTextColor={colors.textSecondary + '60'}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile</Text>
                <TextInput 
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  style={[styles.inputGlass, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                  placeholder="+1 555-0198"
                  placeholderTextColor={colors.textSecondary + '60'}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                <TextInput 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.inputGlass, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                  placeholder="elena@aurora.com"
                  placeholderTextColor={colors.textSecondary + '60'}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Billing Address</Text>
              <TextInput 
                value={billingAddress}
                onChangeText={setBillingAddress}
                multiline
                numberOfLines={2}
                style={[
                  styles.inputGlass, 
                  styles.textareaGlass, 
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }
                ]}
                placeholder="Billing Address..."
                placeholderTextColor={colors.textSecondary + '60'}
              />
            </View>

            {/* Checkbox Shipping */}
            <TouchableOpacity 
              style={styles.checkboxRow} 
              activeOpacity={0.8}
              onPress={() => setShippingIsDifferent(!shippingIsDifferent)}
            >
              <View style={[styles.checkbox, { borderColor: shippingIsDifferent ? colors.primary : colors.border, backgroundColor: shippingIsDifferent ? colors.primary + '1A' : 'transparent' }]}>
                {shippingIsDifferent && <View style={[styles.checkboxTick, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text }]}>Shipping is Different</Text>
            </TouchableOpacity>
          </View>
        </GlassPanel>

        {/* 2. Discount & Tax Logic */}
        <GlassPanel style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.primary, marginBottom: 12 }]}>Discount & Tax Setup</Text>
          
          <View style={styles.radioSetupContainer}>
            {/* Discount Type Radio */}
            <View style={styles.radioBlock}>
              <Text style={[styles.radioBlockTitle, { color: colors.textSecondary }]}>Discount Type</Text>
              <TouchableOpacity 
                style={styles.radioRow} 
                activeOpacity={0.8}
                onPress={() => setDiscountType("FIXED")}
              >
                <View style={[styles.radioOuter, { borderColor: discountType === 'FIXED' ? colors.primary : colors.border }]}>
                  {discountType === 'FIXED' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.radioLabel, { color: colors.text }]}>Fixed Amount</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioRow} 
                activeOpacity={0.8}
                onPress={() => setDiscountType("PERCENTAGE")}
              >
                <View style={[styles.radioOuter, { borderColor: discountType === 'PERCENTAGE' ? colors.primary : colors.border }]}>
                  {discountType === 'PERCENTAGE' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.radioLabel, { color: colors.text }]}>Percentage (%)</Text>
              </TouchableOpacity>
            </View>

            {/* Tax Logic Radio */}
            <View style={styles.radioBlock}>
              <Text style={[styles.radioBlockTitle, { color: colors.textSecondary }]}>Tax Logic</Text>
              <TouchableOpacity 
                style={styles.radioRow} 
                activeOpacity={0.8}
                onPress={() => setTaxLogic("FIXED_SLAB")}
              >
                <View style={[styles.radioOuter, { borderColor: taxLogic === 'FIXED_SLAB' ? colors.primary : colors.border }]}>
                  {taxLogic === 'FIXED_SLAB' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.radioLabel, { color: colors.text }]}>Fixed Slab</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioRow} 
                activeOpacity={0.8}
                onPress={() => setTaxLogic("PER_PRODUCT")}
              >
                <View style={[styles.radioOuter, { borderColor: taxLogic === 'PER_PRODUCT' ? colors.primary : colors.border }]}>
                  {taxLogic === 'PER_PRODUCT' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.radioLabel, { color: colors.text }]}>Per Product</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Discount & Tax input values */}
          <View style={[styles.rowInputs, { marginTop: 12 }]}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Discount Value ({discountType === 'FIXED' ? '$' : '%'})</Text>
              <TextInput 
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="numeric"
                style={[styles.inputGlass, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tax Percentage (%)</Text>
              <TextInput 
                value={taxPercentage}
                onChangeText={setTaxPercentage}
                keyboardType="numeric"
                style={[styles.inputGlass, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
              />
            </View>
          </View>
        </GlassPanel>

        {/* 3. Line Items Section */}
        <View style={styles.lineItemsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primary, paddingLeft: 4 }]}>Line Items</Text>
        </View>

        {lineItems.map((item, idx) => (
          <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.surfaceVariant + 'B3', borderColor: colors.primary + '33' }]}>
            {/* Overlay card controls */}
            <View style={styles.itemCardControls}>
              <TouchableOpacity 
                style={styles.cardActionIcon}
                onPress={() => handleDuplicateItem(item.id)}
              >
                <Copy color={colors.textSecondary} size={16} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cardActionIcon}
                onPress={() => handleDeleteItem(item.id)}
              >
                <Trash2 color={colors.error} size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.itemMainRow}>
              {/* Product Image */}
              <View style={[styles.imageContainer, { borderColor: colors.border + '4D' }]}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]} />
                )}
              </View>

              {/* Product Selector / Input */}
              <View style={styles.itemDetailsContainer}>
                <TextInput
                  value={item.productName}
                  onChangeText={(val) => handleItemChange(item.id, 'productName', val)}
                  style={[styles.itemProductInput, { color: colors.text, borderBottomColor: colors.border + '80' }]}
                  placeholder="Product Name..."
                  placeholderTextColor={colors.textSecondary + '80'}
                />
                
                <TextInput
                  value={item.description}
                  onChangeText={(val) => handleItemChange(item.id, 'description', val)}
                  style={[styles.itemDescInput, { color: colors.textSecondary }]}
                  placeholder="Description..."
                  placeholderTextColor={colors.textSecondary + '60'}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>

            {/* Calculations Row */}
            <View style={styles.itemCalcRow}>
              <View style={styles.calcInputBlock}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Unit Price ($)</Text>
                <TextInput
                  value={item.unitPrice === 0 ? "" : String(item.unitPrice)}
                  onChangeText={(val) => handleItemChange(item.id, 'unitPrice', val)}
                  keyboardType="numeric"
                  style={[styles.calcInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary + '60'}
                />
              </View>

              <View style={styles.calcInputBlock}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Qty</Text>
                <TextInput
                  value={String(item.quantity)}
                  onChangeText={(val) => handleItemChange(item.id, 'quantity', val)}
                  keyboardType="numeric"
                  style={[styles.calcInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                />
              </View>

              <View style={styles.calcTotalBlock}>
                <Text style={[styles.calcLabel, { color: colors.textSecondary }]}>Total</Text>
                <Text style={[styles.calcTotalText, { color: colors.primary }]}>
                  ${(item.unitPrice * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Add Another Item Button */}
        <TouchableOpacity 
          style={[styles.addItemBtn, { backgroundColor: colors.surfaceVariant + '4D', borderColor: colors.primary + '66' }]}
          activeOpacity={0.7}
          onPress={handleAddItem}
        >
          <Plus color={colors.primary} size={16} />
          <Text style={[styles.addItemBtnText, { color: colors.primary }]}>Add Another Item</Text>
        </TouchableOpacity>

        {/* 4. Summary */}
        <GlassPanel style={styles.sectionCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Discount</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              -${discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax ({taxLogic === 'PER_PRODUCT' ? `${taxPercentage}%` : 'Slab'})</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.border + '4D' }]} />

          <View style={[styles.summaryRow, { alignItems: 'flex-end', paddingTop: 4 }]}>
            <Text style={[styles.grandLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.grandValue, { color: colors.primary }]}>
              ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </GlassPanel>

        {/* 5. Timeline & Terms */}
        <GlassPanel style={styles.sectionCard}>
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
              <View style={styles.iconInputWrapper}>
                <Calendar color={colors.textSecondary} size={16} style={styles.inputLeftIcon} />
                <TextInput 
                  value={quotationDate}
                  onChangeText={setQuotationDate}
                  style={[styles.inputGlass, styles.inputGlassIcon, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Valid Until</Text>
              <View style={styles.iconInputWrapper}>
                <Calendar color={colors.textSecondary} size={16} style={styles.inputLeftIcon} />
                <TextInput 
                  value={validUntil}
                  onChangeText={setValidUntil}
                  style={[styles.inputGlass, styles.inputGlassIcon, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }]}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput 
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              style={[
                styles.inputGlass, 
                styles.textareaGlass, 
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.background + '50' }
              ]}
              placeholder="Optional notes for the client..."
              placeholderTextColor={colors.textSecondary + '60'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Terms & Conditions</Text>
            <TextInput 
              value={terms}
              onChangeText={setTerms}
              multiline
              numberOfLines={3}
              style={[
                styles.inputGlass, 
                styles.textareaGlass, 
                { color: colors.textSecondary, borderColor: colors.border, backgroundColor: colors.background + '50' }
              ]}
            />
          </View>
        </GlassPanel>

        {/* Bottom Action Button (Placed inside ScrollView to clear tab bar) */}
        <View style={styles.createBtnContainer}>
          <TouchableOpacity 
            style={[styles.createBtn, { shadowColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={handleCreateQuotation}
          >
            <LinearGradient
              colors={isDark ? ['#7dd3fc', '#0284c7'] : [colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtnGradient}
            >
              <Send color={isDark ? '#001f2e' : '#ffffff'} size={18} style={{ marginRight: 8 }} />
              <Text style={[styles.createBtnText, { color: isDark ? '#001f2e' : '#ffffff' }]}>Create Quotation</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowCircle1: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  glowCircle2: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 1,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionCard: {
    borderRadius: 14,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  addNewText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 16,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  dropdownSearchIcon: {
    marginRight: 8,
  },
  dropdownTriggerText: {
    flex: 1,
    fontSize: 15,
  },
  dropdownList: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 15,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputGlass: {
    borderWidth: 1,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textareaGlass: {
    height: 64,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  radioSetupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  radioBlock: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
  },
  radioBlockTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 14,
  },
  lineItemsHeader: {
    marginTop: 8,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
    gap: 12,
    overflow: 'hidden',
  },
  itemCardControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  cardActionIcon: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemMainRow: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 60, // Avoid overlapping controls
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  itemDetailsContainer: {
    flex: 1,
    gap: 6,
  },
  itemProductInput: {
    fontSize: 15,
    fontWeight: '600',
    borderBottomWidth: 1,
    paddingBottom: 4,
    paddingTop: 0,
  },
  itemDescInput: {
    fontSize: 12,
    textAlignVertical: 'top',
    padding: 0,
  },
  itemCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 234, 255, 0.08)',
    paddingTop: 12,
  },
  calcInputBlock: {
    width: width * 0.22,
  },
  calcLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  calcInput: {
    borderWidth: 1,
    borderRadius: 8,
    height: 36,
    textAlign: 'center',
    fontSize: 13,
    padding: 0,
  },
  calcTotalBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  calcTotalText: {
    fontSize: 15,
    fontWeight: '600',
    height: 36,
    textAlignVertical: 'center',
    paddingTop: 6,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  addItemBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  grandLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  grandValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  iconInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputLeftIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 5,
  },
  inputGlassIcon: {
    paddingLeft: 38,
  },
  createBtnContainer: {
    marginTop: 24,
    marginBottom: 16,
    width: '100%',
  },
  createBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
