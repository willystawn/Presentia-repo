import React, {useState, useRef} from 'react';
import {StyleSheet, View, FlatList, Animated} from 'react-native';

import slides from '../../assets/slides';
import {OnBoardingItem} from './onBoardingItem';
import {Paginator} from './paginator';
import {NextButton} from './nextButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppNavigator} from '../../screens/navigation';

export const OnBoarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [next, setNext] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({viewableItems}) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({index: currentIndex + 1});
      return;
    } else {
      try {
        await AsyncStorage.setItem('@viewedOnboarding', 'true');
        setNext(true);
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (!next) {
    return (
      <View style={styles.container}>
        <View style={{flex: 3}}>
          <FlatList
            data={slides}
            renderItem={item => <OnBoardingItem item={item} />}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            keyExtractor={item => item.id}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {
                useNativeDriver: false,
              },
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
        </View>
        <Paginator data={slides} scrollX={scrollX} />
        <NextButton
          scrollTo={scrollTo}
          percentage={(currentIndex + 1) * (100 / slides.length)}
        />
      </View>
    );
  } else {
    return <AppNavigator />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
