import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

import type {CampusStackParamList} from '@/app/navigation/types';
import {
  V2SegmentedControl,
  V2StateCard,
  type V2SegmentedControlItem,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {TimetableAddCourseSheet} from '../components/v2/TimetableAddCourseSheet';
import {TimetableAllViewCard} from '../components/v2/TimetableAllViewCard';
import {TimetableCourseDetailSheet} from '../components/v2/TimetableCourseDetailSheet';
import {TimetableDetailHeader} from '../components/v2/TimetableDetailHeader';
import {TimetableSemesterSheet} from '../components/v2/TimetableSemesterSheet';
import {TimetableSupplementSection} from '../components/v2/TimetableSupplementSection';
import {TimetableTodayViewCard} from '../components/v2/TimetableTodayViewCard';
import {useTimetableDetailData} from '../hooks/useTimetableDetailData';
import type {TimetableDetailViewMode} from '../model/timetableDetailViewData';

const MODE_ITEMS: V2SegmentedControlItem<TimetableDetailViewMode>[] = [
  {id: 'today', label: '오늘 시간표'},
  {id: 'all', label: '전체 시간표'},
];

type TimetableDetailRouteProp = RouteProp<CampusStackParamList, 'TimetableDetail'>;
type TimetableDetailNavigationProp = NativeStackNavigationProp<
  CampusStackParamList,
  'TimetableDetail'
>;

export const TimetableDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<TimetableDetailNavigationProp>();
  const route = useRoute<TimetableDetailRouteProp>();
  const initialView = route.params?.initialView ?? 'all';
  const [semesterSheetVisible, setSemesterSheetVisible] = React.useState(false);
  const autoOpenedEditRef = React.useRef(false);

  const {
    activeMode,
    addCatalogCourse,
    addManualCourse,
    addSheetVisible,
    closeAddSheet,
    closeCourseDetail,
    data,
    error,
    loading,
    openAddSheet,
    openCourseDetail,
    reload,
    removeSelectedCourse,
    selectColor,
    selectMode,
    selectSemester,
    setAddSheetTab,
    setManualCredits,
    setManualDay,
    setManualEndPeriod,
    setManualField,
    setManualOnline,
    setManualStartPeriod,
    setQuery,
    shareTimetable,
    toggleNightClasses,
  } = useTimetableDetailData(initialView);

  React.useEffect(() => {
    if (route.params?.mode === 'edit' && !autoOpenedEditRef.current) {
      autoOpenedEditRef.current = true;
      openAddSheet();
    }
  }, [openAddSheet, route.params?.mode]);

  const selectedCourseId = data?.selectedCourse?.courseId;
  const hasAnyCourse =
    Boolean(data?.allView.blocks.length) ||
    Boolean(data?.allView.onlineItems.length) ||
    Boolean(data?.allView.saturdayItems.length);

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerSurface}>
          <TimetableDetailHeader
            onPressAdd={openAddSheet}
            onPressBack={() => navigation.goBack()}
            onPressSemester={() => setSemesterSheetVisible(true)}
            onPressShare={() => {
              shareTimetable().catch(() => undefined);
            }}
            semesterLabel={data?.semesterLabel ?? '시간표'}
          />

          <View style={styles.toolbar}>
            <V2SegmentedControl
              items={MODE_ITEMS}
              onSelect={selectMode}
              selectedId={activeMode}
              style={styles.modeControl}
              variant="surface"
            />

            {data ? (
              <View style={styles.creditContainer}>
                <Text style={styles.creditMuted}>총 </Text>
                <Text style={styles.creditStrong}>
                  {data.totalCreditsLabel.replace(/^총\s*/, '').replace('학점', '')}
                </Text>
                <Text style={styles.creditMuted}>학점</Text>
              </View>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {loading && !data ? (
            <V2StateCard
              description="이번 학기 시간표를 준비하고 있습니다."
              icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
              style={styles.stateCard}
              title="시간표를 불러오는 중"
            />
          ) : null}

          {error && !data ? (
            <V2StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={V2_COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => {
                reload().catch(() => undefined);
              }}
              style={styles.stateCard}
              title="시간표를 불러오지 못했습니다"
            />
          ) : null}

          {data && !hasAnyCourse ? (
            <V2StateCard
              actionLabel="수업 추가"
              description="우측 상단 추가 버튼이나 직접 입력으로 새 수업을 넣어보세요."
              icon={
                <Icon
                  color={V2_COLORS.brand.primaryStrong}
                  name="calendar-outline"
                  size={28}
                />
              }
              onPressAction={openAddSheet}
              style={styles.stateCard}
              title="등록된 수업이 없습니다"
            />
          ) : null}

          {data && hasAnyCourse ? (
            <>
              {activeMode === 'all' ? (
                <>
                  <TimetableAllViewCard
                    blocks={data.allView.blocks}
                    columns={data.allView.columns}
                    onPressBlock={openCourseDetail}
                    periods={data.allView.periods}
                  />

                <TimetableSupplementSection
                  items={data.allView.onlineItems}
                  kind="online"
                  onPressItem={openCourseDetail}
                  selectedCourseId={selectedCourseId}
                  title="온라인 수업"
                />

                <TimetableSupplementSection
                  items={data.allView.saturdayItems}
                  kind="saturday"
                  onPressItem={openCourseDetail}
                  selectedCourseId={selectedCourseId}
                  title="토요일 수업"
                  />
                </>
              ) : (
                <TimetableTodayViewCard
                  onPressCourse={openCourseDetail}
                  onToggleNightClasses={toggleNightClasses}
                  rows={data.todayView.rows}
                  selectedCourseId={selectedCourseId}
                  showNightToggle={data.todayView.hasNightClasses}
                  toggleLabel={data.todayView.nightToggleLabel}
                />
              )}
            </>
          ) : null}
        </ScrollView>

        {data ? (
          <TimetableSemesterSheet
            onClose={() => setSemesterSheetVisible(false)}
            onSelectSemester={semesterId => {
              selectSemester(semesterId).catch(() => undefined);
            }}
            options={data.semesterOptions}
            selectedLabel={data.semesterLabel}
            visible={semesterSheetVisible}
          />
        ) : null}

        {data ? (
          <TimetableAddCourseSheet
            data={data.addCourseSheet}
            onAddCatalogCourse={courseId => {
              addCatalogCourse(courseId).catch(() => undefined);
            }}
            onClose={closeAddSheet}
            onSelectColor={selectColor}
            onSelectCredits={setManualCredits}
            onSelectDay={setManualDay}
            onSetManualEndPeriod={setManualEndPeriod}
            onSetManualField={setManualField}
            onSetManualOnline={setManualOnline}
            onSetManualStartPeriod={setManualStartPeriod}
            onSubmitManualCourse={() => {
              addManualCourse().catch(() => undefined);
            }}
            onSwitchTab={setAddSheetTab}
            onUpdateQuery={setQuery}
            visible={addSheetVisible}
          />
        ) : null}

        <TimetableCourseDetailSheet
          course={data?.selectedCourse}
          onClose={closeCourseDetail}
          onDelete={removeSelectedCourse}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
  },
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingBottom: V2_SPACING.xxl,
    paddingTop: 16,
  },
  headerSurface: {
    backgroundColor: V2_COLORS.background.surface,
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  modeControl: {
    width: 188,
  },
  creditContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  creditMuted: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  creditStrong: {
    color: V2_COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  stateCard: {
    marginHorizontal: 16,
  },
});
