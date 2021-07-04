import React from 'react';
import {View, useWindowDimensions, Text} from 'react-native';
import {global} from '../styles/global';

export const Header = ({title, description}) => {
  const {width} = useWindowDimensions();
  return (
    <View
      style={{
        backgroundColor: '#119DA4',
        flex: 0.3,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomLeftRadius: width / 15,
        borderBottomRightRadius: width / 15,
        marginBottom: width * (4 / 100),
        ...global.shadow,
      }}>
      <Text style={global.headerText}>{title}</Text>
      <Text style={global.headerDescription}>{description}</Text>
    </View>
  );
};
