import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SpiralTestScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/Book-Spiral.png')} // ✅ Adjust path if needed
        style={styles.image}
        resizeMode="contain"
        onError={(err) => console.log('Image load error:', err.nativeEvent)} // 🐞 For debugging
      />
    </View>
  );
};

export default SpiralTestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 300,
    height: 40
  }
});
