# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native core / bridge
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# RN bridge / Turbo modules / Native modules
-keepclassmembers class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers class * extends com.facebook.react.bridge.ReactModuleWithSpec { *; }
-keepclassmembers class * extends com.facebook.react.turbomodule.core.interfaces.TurboModule { *; }
-keep class com.swmansion.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# Firebase (Auth, Firestore, Messaging 등)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Google Play services / Maps
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# WebView / React Native WebView
-keep class com.reactnativecommunity.webview.** { *; }

# Prevent stripping of CRL used by okhttp
-dontwarn javax.annotation.**
-keepattributes *Annotation*,InnerClasses
