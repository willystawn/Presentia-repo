import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import {global} from '../styles/global';

export const CardJadwal = ({data}) => {
  const [accordionItem, setAccordionItem] = React.useState(data[0]);
  const [selected, setSelected] = React.useState(data[0].day);

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const renderScheduleTitle = () =>
    data.map(el => {
      return (
        <TouchableOpacity
          key={el.day}
          style={{flex: 1}}
          onPress={() => {
            seeSchedule(el);
            setSelected(el.day);
          }}>
          <View
            style={{
              ...global.card,
              alignItems: 'center',
              backgroundColor: selected == el.day ? '#119DA4' : '#FFF',
            }}>
            <Text
              style={{
                ...global.cardTextGrey,
                color: selected == el.day ? '#FFF' : '#AAA',
              }}>
              {el.day.slice(0, 3)}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });

  const seeSchedule = el => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccordionItem(el);
    return;
  };

  const renderScheduleContent = () =>
    accordionItem.name.map((el, id) => {
      return (
        <Text key={accordionItem.name[id]} style={global.cardTextMain}>
          <Text key={accordionItem.name[id]} style={global.cardTextGrey}>
            {accordionItem.start[id]}-{accordionItem.end[id]}
          </Text>{' '}
          • {accordionItem.name[id]}
        </Text>
      );
    });

  return (
    <>
      <View style={{...global.wrapper, flexDirection: 'row'}}>
        {renderScheduleTitle()}
      </View>

      <View style={global.wrapper}>
        <View style={global.card}>{renderScheduleContent()}</View>
      </View>
    </>
  );
};
