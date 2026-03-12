import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { parseHashtags } from '@/shared/lib/text/hashtagParser';

interface HashTagTextProps {
  text: string;
  onHashtagPress: (tag: string) => void;
  style?: any;
}

export const HashTagText: React.FC<HashTagTextProps> = ({ 
  text, 
  onHashtagPress,
  style 
}) => {
  const parts = parseHashtags(text);
  
  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <Text
              key={index}
              style={styles.hashtag}
              onPress={() => onHashtagPress(part.tag!)}
            >
              {part.content}
            </Text>
          );
        }
        return <Text key={index}>{part.content}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  hashtag: {
    color: COLORS.accent.blue,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
