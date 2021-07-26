import React from 'react';
import {View, Text, Linking, Pressable, ToastAndroid} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

import {global} from '../styles/global';

import {Accordion} from './accordion';

//Card tugas
export const CardTugas = ({
  category,
  title,
  content,
  created,
  file = '',
  categoryOne,
  url = '',
  type = '',
  deadline,
  accorn = true,
}) => {
  const deadlineReverse = deadline.split('/').reverse().join('/');
  const estimatedDeadline = Math.ceil(
    (new Date(deadlineReverse).getTime() - new Date().getTime()) /
      (1000 * 3600 * 24),
  );

  const fileName = file?.length >= 30 ? file?.slice(0, 30) + ' ...' : file;
  const iconColor = estimatedDeadline <= 1 ? '#b51941' : '#aaa';
  const cardStyle =
    estimatedDeadline <= 1
      ? {...global.cardDanger, borderColor: '#b51941'}
      : global.card;

  const fileContent = () => {
    if (file?.length > 0) {
      return (
        <>
          <View style={global.divider} />

          <Pressable
            onPress={() => Linking.openURL(url)}
            android_ripple={{color: 'rgba(0,0,0, .1)', radius: 1000}}
            onLongPress={() => {
              Clipboard.setString(url);
              ToastAndroid.show('Berhasil disalin', ToastAndroid.SHORT);
            }}>
            <Text style={global.cardTextMain}>
              <MaterialCommunityIcons
                name="file-download-outline"
                size={17}
                color="#119DA4"
              />{' '}
              [{type}] {fileName}
            </Text>
          </Pressable>
        </>
      );
    }
  };

  const renderHead = () => <Text style={global.cardTitle}>{title}</Text>;

  const renderContent = () => {
    return (
      <>
        <View style={global.divider} />
        <Text style={global.cardTextMain} selectable={true}>
          {content}
        </Text>

        {fileContent()}
      </>
    );
  };

  return (
    <>
      {accorn && (<>
      
      	{categoryOne && (
        <View style={global.wrapper}>
          <Text style={global.catTitle}>{category}</Text>
        </View>)}
        </>
      )}
      <View style={global.wrapper}>
        <View style={cardStyle}>
          {accorn && (
            <Accordion renderContent={renderContent} renderHead={renderHead}>
              <Text style={{...global.cardLabel, color: iconColor}}>
                <MaterialCommunityIcons
                  name="calendar-range"
                  color={iconColor}
                  size={12}
                />{' '}
                {deadline} • {estimatedDeadline} Hari lagi
              </Text>
            </Accordion>
          )}

          {!accorn && (
            <>
              {renderHead()}
              <Text style={global.cardLabel}>
                <MaterialCommunityIcons
                  name="calendar-range"
                  color="#AAA"
                  size={12}
                />{' '}
                {created} - {deadline} • {category}
              </Text>
              {renderContent()}
            </>
          )}
        </View>
      </View>
    </>
  );
};
