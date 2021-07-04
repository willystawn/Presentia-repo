import React from "react";
import { View } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export const BottomMenuItem = ({ iconName, isCurrent }) => {
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={32}
        style={{ color: isCurrent ? '#119DA4' : '#999' }}
      />
    </View>
  );
};