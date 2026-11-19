import { Image } from 'react-native';
export function CityLogo({ size = 40 }: { size?: number }) {
  return <Image source={require('../../assets/brand/pit-app-icon.png')} style={{ width: size, height: size, borderRadius: size * 0.25 }}
    accessible accessibilityLabel="Logo CityWatch com P.I.T." />;
}
