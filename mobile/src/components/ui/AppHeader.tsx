import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Home, Search, Filter } from 'lucide-react-native';

const HEADER_CONTENT_HEIGHT = 56;

interface AppHeaderProps {
  /** The page title to display */
  title: string;
  /** Called when the search icon is pressed. If omitted, the search icon is hidden. */
  onSearchPress?: () => void;
  /** Called when the filter icon is pressed. If omitted, the filter icon is hidden. */
  onFilterPress?: () => void;
  /** Whether search is currently active (highlights the icon) */
  searchActive?: boolean;
  /** Whether a filter is currently applied (highlights the icon) */
  filterActive?: boolean;
  /** When true, replaces the title with a search TextInput */
  showSearchInput?: boolean;
  /** Ref for the search TextInput */
  searchInputRef?: React.RefObject<TextInput | null>;
  /** Current search text value */
  searchText?: string;
  /** Called when search text changes */
  onSearchTextChange?: (text: string) => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Called when the search input loses focus */
  onSearchBlur?: () => void;
}

export function AppHeader({
  title,
  onSearchPress,
  onFilterPress,
  searchActive = false,
  filterActive = false,
  showSearchInput = false,
  searchInputRef,
  searchText = '',
  onSearchTextChange,
  searchPlaceholder = 'Search...',
  onSearchBlur,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleHomePress = () => {
    router.navigate('/(app)/dashboard');
  };

  const showRightActions = !!onFilterPress || !!onSearchPress;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Home button */}
        <Pressable
          onPress={handleHomePress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <Home size={22} color="#A0B4C4" strokeWidth={2.2} />
        </Pressable>

        {/* Center: Title or Search Input */}
        <View style={styles.titleContainer}>
          {showSearchInput ? (
            <TextInput
              ref={searchInputRef}
              value={searchText}
              onChangeText={onSearchTextChange}
              placeholder={searchPlaceholder}
              placeholderTextColor="#708090"
              autoCorrect={false}
              autoCapitalize="none"
              onBlur={onSearchBlur}
              style={styles.searchInput}
            />
          ) : (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right: Filter + Search icons (only shown when callbacks are provided) */}
        {showRightActions && (
          <View style={styles.rightActions}>
            {onFilterPress && (
              <Pressable
                onPress={onFilterPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <Filter
                  size={22}
                  color={filterActive ? '#7DD3FC' : '#A0B4C4'}
                  strokeWidth={2.2}
                />
              </Pressable>
            )}
            {onSearchPress && (
              <Pressable
                onPress={onSearchPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
              >
                <Search
                  size={22}
                  color={searchActive ? '#7DD3FC' : '#A0B4C4'}
                  strokeWidth={2.2}
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 21, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 211, 252, 0.1)',
    zIndex: 10,
  },
  content: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(125, 211, 252, 0.1)',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#E0E8F0',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchInput: {
    color: '#E0E8F0',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
