import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { BlurView } from 'expo-blur';
import { FileText, Package, Plus, BarChart3, Settings } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

export function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBackgroundWrapper}>
        <Svg width="100%" height="100%" viewBox="0 0 400 48" preserveAspectRatio="none">
          <Path 
            d="M0 24C0 10.7452 10.7452 0 24 0H140C145 0 155 2 160 6C175 20 180 32 200 32C220 32 225 20 240 6C245 2 255 0 260 0H376C389.255 0 400 10.7452 400 24V24C400 37.2548 389.255 48 376 48H24C10.7452 48 0 37.2548 0 24V24Z" 
            fill="rgba(20, 28, 46, 0.7)" 
          />
          <Path 
            d="M0 24C0 10.7452 10.7452 0 24 0H140C145 0 155 2 160 6C175 20 180 32 200 32C220 32 225 20 240 6C245 2 255 0 260 0H376C389.255 0 400 10.7452 400 24V24C400 37.2548 389.255 48 376 48H24C10.7452 48 0 37.2548 0 24V24Z" 
            stroke="rgba(125, 211, 252, 0.2)" 
            strokeWidth="1" 
          />
        </Svg>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.tabContent}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === '_sitemap' || route.name === '+not-found' || route.name === 'dashboard') return null;

          const isFocused = state.index === index;
          const color = isFocused ? '#7dd3fc' : '#a0b4c4';
          
          const onPress = () => {
            if (route.name === 'dummy') return; // Do nothing for center dummy tab
            
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === 'dummy') {
            return (
              <View key={route.key} style={styles.fabContainer}>
                <TouchableOpacity style={styles.fabButton} activeOpacity={0.8}>
                  <Plus color="#001f2e" size={28} strokeWidth={3} />
                </TouchableOpacity>
              </View>
            );
          }

          let Icon = FileText;
          if (route.name === 'quotations') Icon = FileText;
          if (route.name === 'products') Icon = Package;
          if (route.name === 'reports') Icon = BarChart3;
          if (route.name === 'settings') Icon = Settings;

          return (
            <TouchableOpacity 
              key={route.key} 
              onPress={onPress} 
              style={styles.tabItem}
            >
              <Icon color={color} size={24} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 60,
    zIndex: 50,
  },
  tabBackgroundWrapper: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    overflow: 'hidden',
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    zIndex: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7dd3fc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0a0e1a',
    shadowColor: '#7dd3fc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
});
