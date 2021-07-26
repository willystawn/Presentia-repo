import React from 'react';
import { View, Text, Linking, Pressable, ToastAndroid } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

import { global } from '../styles/global';

import { Accordion } from './accordion';

export const CardPengumuman = ({ title, content, created, file = '', url = '', type = '', accorn=true }) => {


  const fileName = file?.length >= 30 ? file?.slice(0, 30) + ' ...' : file

  const fileContent = () => {
    if(file?.length > 0){
      return (
        <>
          <View style={global.divider}/>
        
          <Pressable 
            onPress={ () => Linking.openURL(url)} 
            android_ripple ={{color: 'rgba(0,0,0, .1)', radius: 1000}}
            onLongPress={ () => {
              Clipboard.setString(url);
              ToastAndroid.show('Berhasil disalin', ToastAndroid.SHORT)
              }}
            >
            <Text style={global.cardTextMain}>
              <MaterialCommunityIcons name='file-download-outline' size={17} color='#119DA4'/> [{type}] {fileName}
            </Text>
          </Pressable>
        </>
      )
    }
  }

  const renderHead = () => ( <Text style={global.cardTitle}>{title}</Text>)
  
  const renderContent = () => {
    return (
      <>
        <View style={global.divider}/>
        <Text style={global.cardTextMain} selectable={true}>{content}</Text>

        {fileContent()}  
      </>
    )
  }

  return (
      <View style={global.wrapper}>
        <View style={global.card}>

        {
          accorn &&
          <Accordion
            renderContent={renderContent}
            renderHead={renderHead}
          >
            
            <Text style={global.cardLabel}>
              <MaterialCommunityIcons name='calendar-range' color='#AAA' size={12}/> {created}
            </Text>
          </Accordion>
        }

      {
        !accorn &&
        (
          <>
            {renderHead()}
            <Text style={global.cardLabel}>
              <MaterialCommunityIcons name='calendar-range' color='#AAA' size={12}/> {created}
            </Text>
            {renderContent()}
          </>
        )
      }
        </View>
      </View>
  )
}
