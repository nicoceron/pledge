import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");
const DAY_WIDTH = width / 7;

// Generate all days of the current year
const getYearDays = () => {
  const year = new Date().getFullYear();
  const days = [];
  const date = new Date(year, 0, 1);
  while (date.getFullYear() === year) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

interface CalendarProps {
  /** Currently selected date */
  date: Date;
  /** Callback when the user selects a new date */
  onChange: (date: Date) => void;
}

/**
 * Horizontal calendar strip that shows all days of the year.
 * – Updates the selected date as the user scrolls, keeping the center item selected.
 * – Tapping a day selects it and scrolls it to the center.
 * – Tapping the big date text opens the platform date-picker.
 */
const Calendar: React.FC<CalendarProps> = ({ date, onChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const flatListRef = useRef<FlatList<Date>>(null);
  const isInitialMount = useRef(true);
  const isTapScrolling = useRef(false);

  // Memoize the array of days for the current year
  const days = useMemo(() => getYearDays(), []);

  // When date changes (from any source), scroll the chosen date to the center.
  useEffect(() => {
    if (flatListRef.current && days.length > 0) {
      const index = days.findIndex(
        (d) => d.toDateString() === date.toDateString()
      );
      if (index !== -1) {
        // On initial mount, scroll without animation.
        // On subsequent updates (e.g., from date picker or tap), scroll with animation.
        // Set a flag so the onMomentumScrollEnd handler can ignore this programmatic scroll.
        if (!isInitialMount.current) {
          isTapScrolling.current = true;
        }

        setTimeout(
          () => {
            if (flatListRef.current) {
              const offset = index * DAY_WIDTH;
              flatListRef.current.scrollToOffset({
                offset,
                animated: !isInitialMount.current,
              });
              isInitialMount.current = false;
            }
          },
          isInitialMount.current ? 50 : 0
        );
      }
    }
  }, [date, days]);

  const handlePickerChange = (e: DateTimePickerEvent, newDate?: Date) => {
    setShowDatePicker(false);
    if (newDate) {
      const clean = new Date(newDate);
      clean.setHours(0, 0, 0, 0);
      onChange(clean);
    }
  };

  // When a day is tapped, update the state. The useEffect above will handle scrolling.
  const handleDayPress = (day: Date) => {
    onChange(day);
  };

  // When user scroll finishes, simply update the selected date to the one in the center.
  // The useEffect hook above will then handle scrolling it into the perfect centered position.
  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // If the scroll was from a tap/programmatic, consume the flag and do nothing.
      if (isTapScrolling.current) {
        isTapScrolling.current = false;
        return;
      }

      const contentOffset = e.nativeEvent.contentOffset;
      const index = Math.round(contentOffset.x / DAY_WIDTH);

      if (index >= 0 && index < days.length) {
        const newSelectedDate = days[index];
        if (
          newSelectedDate &&
          newSelectedDate.toDateString() !== date.toDateString()
        ) {
          onChange(newSelectedDate);
        }
      }
    },
    [days, date, onChange]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handlePickerChange}
        />
      )}
      <FlatList
        ref={flatListRef}
        horizontal
        data={days}
        keyExtractor={(item) => item.toISOString()}
        renderItem={({ item }) => {
          const isSelected = item.toDateString() === date.toDateString();
          return (
            <TouchableOpacity
              onPress={() => handleDayPress(item)}
              style={[
                styles.dayContainer,
                isSelected && styles.selectedDayContainer,
              ]}
            >
              <Text
                style={[styles.dayText, isSelected && styles.selectedDayText]}
              >
                {item.getDate()}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingHorizontal: (width - DAY_WIDTH) / 2 }}
        getItemLayout={(data, index) => ({
          length: DAY_WIDTH,
          offset: DAY_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 20,
  },
  dayContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: DAY_WIDTH,
  },
  selectedDayContainer: {
    backgroundColor: "#EF4444",
    borderRadius: 25,
  },
  dayText: {
    fontSize: 16,
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Calendar;
