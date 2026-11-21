# Room's generated database implementations are instantiated by reflection.
# Explicitly retain the constructor with the SDK 58 / AGP 9 R8 full mode.
# AndroidX fix: https://android.googlesource.com/platform/frameworks/support/+/e4765e38e27a3f4d86188b996df97a52403dff46
-keep class * extends androidx.room.RoomDatabase { public <init>(); }
