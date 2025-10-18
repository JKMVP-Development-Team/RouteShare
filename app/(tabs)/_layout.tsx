// app/(tabs)/_layout.tsx
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#c7d0e0",
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 24,
          right: 24,
          backgroundColor: "#0A2540",
          borderRadius: 25,
          height: 60,
          borderTopWidth: 0,
          elevation: 10,
          paddingHorizontal: 40,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      {/* Left tab */}
      <Tabs.Screen
        name="explorepage"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="message.fill" color={color} />
          ),
        }}
      />

      {/* Center tab (home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Right tab */}
      <Tabs.Screen
        name="input-code"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.2.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
