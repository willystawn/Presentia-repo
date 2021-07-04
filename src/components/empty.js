import React from 'react';
import {View, Image, Text} from 'react-native';

import {global} from '../styles/global';

export const Empty = ({msg}) => {
  return (
    <View style={global.wrapper}>
      <View style={global.card}>
        <Image
          source={require('../assets/illust/404.png')}
          style={{
            resizeMode: 'contain',
            width: '70%',
            height: 150,
            alignSelf: 'center',
          }}
        />
        <Text
          style={{
            ...global.cardTextGrey,
            alignSelf: 'center',
            textAlign: 'center',
          }}>
          {msg}
        </Text>
      </View>
    </View>
  );
};
