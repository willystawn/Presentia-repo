import React from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { global } from '../styles/global';

export const Accordion = ({renderHead, renderContent, children}) => {

  const [accordionItem, setAccodionItem] = React.useState({})

  if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleExpand = () =>{
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccodionItem({...accordionItem, expanded : !accordionItem.expanded})
  }
  return (
      <>
        <TouchableOpacity onPress={()=>toggleExpand()} style={{
          flexDirection: 'row',
          justifyContent:'space-between',
          alignItems:'flex-start'}}>
          {renderHead()}
          <View>
            <MaterialCommunityIcons name={accordionItem.expanded ? 'menu-up' : 'menu-down'} size={30} color='#119DA4' />
          </View>
        </TouchableOpacity>
        {children}

        {
          accordionItem.expanded &&
          <>
            {renderContent()}
          </>
        }
      </>
  );
}
