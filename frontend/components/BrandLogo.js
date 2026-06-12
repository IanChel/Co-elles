import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function BrandLogo({ size = 40, width, height, style }) {
  return (
    <Image 
      source={require('../assets/branding/logo-temp.png')} 
      style={[
        styles.logo,
        { 
          width: width || size, 
          height: height || size 
        },
        style
      ]} 
      resizeMode="contain" 
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // Styles de base s'il y en a
  }
});
