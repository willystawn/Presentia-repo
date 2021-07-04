import React from 'react';
import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native';


export const OnBoardingItem = ({item}) => {

	const { width } = useWindowDimensions()

	return(
		<View style={[styles.container,{ width }]}>
			<Image source={item.item.image} style={[styles.image, {width, resizeMode: 'contain'}]}/>
			<View style={{ flex: 0.3 }}>
				<Text style={styles.title}>{item.item.title}</Text>
				<Text style={styles.description}>{item.item.description}</Text>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},

	image: {
		flex: 0.7,
		justifyContent: 'center'
	},

	title: {
		fontFamily: 'Sarabun-Bold',
		fontSize: 26,
		marginBottom: 0,
		paddingHorizontal: 10,
		color: '#119DA4',
		textAlign: 'center'
	},

	description: {
		fontFamily: 'Sarabun-Medium',
		color: '#AAA',
		textAlign: 'center',
		fontSize: 16,
		paddingHorizontal: 64
	}
})