import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { activeIcon, inactiveTintColor } from 'src/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: activeIcon,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'All Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="myPlan"
        options={{
          title: 'My Plan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'none',
    marginBottom: 2,
  },
  tabBarStyle: {
    height: 60,
    paddingTop: 6,
    paddingBottom: 8,
  },
});
