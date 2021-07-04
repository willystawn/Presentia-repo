import React from 'react';
import { StyleSheet, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const NextButton = ({ percentage, scrollTo }) => {
	const { width } = useWindowDimensions()
	return(
		<View style={global.container}>
			<AnimatedCircularProgress
			  rotation={0}
			  size={100}
			  width={4}
			  backgroundWidth={2}
			  fill={percentage}
			  style={styles.circle}
			  tintColor="#119DA4"
			  lineCap="round"
			  duration={300}
			  backgroundColor="#EDE7E8"
			/>
			<TouchableOpacity onPress={scrollTo} style={styles.button} activeOpacity={0.6}>
				<MaterialCommunityIcons name='arrow-right' size={32} color="#FFF"/>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},

	button: {
		position: 'absolute',
		backgroundColor: '#119DA4',
		borderRadius: 100,
		right:15,
		top: 15,
		padding: 20,
	},

	circle: {
		alignItems: 'center',
		marginBottom: 10
	}
})