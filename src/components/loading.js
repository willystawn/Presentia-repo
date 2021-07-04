import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Spinner from 'react-native-spinkit';

export const Loading = ({green}) => {
  return (
    <View
      style={[style.container, {backgroundColor: green ? '#119DA4' : 'white'}]}>
      <Spinner
        style={style.loading}
        isVisible={true}
        size={100}
        type="ChasingDots"
        color={green ? 'white' : '#119DA4'}
      />
      <Text style={[style.text, {color: green ? 'white' : '#119DA4'}]}>
        Memuat
      </Text>
    </View>
  );
};

const style = StyleSheet.create({
  loading: {
    alignSelf: 'center',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,1)',
  },

  text: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Sarabun-Bold',
  },
});
