import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
	const router = useRouter();
	
	useEffect(() => {
		console.log('Index.tsx mounted');
		// Auto-redirect after a short delay
		const timer = setTimeout(() => {
			console.log('Redirecting to /(tabs)');
			router.replace('/(tabs)');
		}, 100);
		
		return () => clearTimeout(timer);
	}, []);
	
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Loading RouteShare...</Text>
			<TouchableOpacity 
				style={styles.button}
				onPress={() => router.push('/(tabs)')}
			>
				<Text style={styles.buttonText}>Go to Home</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	text: {
		fontSize: 18,
		marginBottom: 20,
	},
	button: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 8,
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});
