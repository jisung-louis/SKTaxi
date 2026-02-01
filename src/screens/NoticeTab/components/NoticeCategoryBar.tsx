// SKTaxi: 카테고리 필터 바 컴포넌트 - SRP 분리
// NoticeScreen에서 분리된 카테고리 칩 바

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { NOTICE_CATEGORIES, NoticeCategory } from '../constants/noticeCategories';

interface NoticeCategoryBarProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

/**
 * 공지사항 카테고리 필터 바
 * SRP: 카테고리 선택 UI만 담당
 */
export function NoticeCategoryBar({ selectedCategory, onSelectCategory }: NoticeCategoryBarProps) {
    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryBar}
            >
                {NOTICE_CATEGORIES.map((cat) => {
                    const active = cat === selectedCategory;
                    return (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, active && styles.categoryChipActive]}
                            onPress={() => onSelectCategory(cat)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    categoryBar: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    categoryChip: {
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryChipActive: {
        backgroundColor: COLORS.accent.green + '20',
        borderColor: COLORS.accent.green,
    },
    categoryChipText: {
        ...TYPOGRAPHY.body2,
        color: COLORS.text.secondary,
        fontWeight: '600',
        lineHeight: 18,
    },
    categoryChipTextActive: {
        color: COLORS.accent.green,
        fontWeight: '600',
    },
});
