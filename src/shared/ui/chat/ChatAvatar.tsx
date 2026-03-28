import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {RADIUS} from '@/shared/design-system/tokens';

import type {ChatAvatarViewData} from './types';

interface ChatAvatarProps {
  avatar?: ChatAvatarViewData
  size?: number
}

export const ChatAvatar = ({
  avatar,
  size = 36,
}: ChatAvatarProps) => {
  if (!avatar) {
    return <View style={[styles.avatarSpacer, {height: size, width: size}]} />;
  }

  if (avatar.kind === 'image') {
    return (
      <Image
        source={{uri: avatar.uri}}
        style={[styles.avatarImage, {borderRadius: size / 2, height: size, width: size}]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarCircle,
        {
          backgroundColor: avatar.backgroundColor,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
      ]}>
      {avatar.kind === 'label' ? (
        <Text style={[styles.avatarLabel, {color: avatar.textColor}]}>
          {avatar.label}
        </Text>
      ) : (
        <Icon color={avatar.iconColor} name={avatar.iconName} size={16} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    borderRadius: RADIUS.pill,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  avatarSpacer: {
    height: 36,
    width: 36,
  },
});
