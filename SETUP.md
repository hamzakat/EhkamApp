# Ehkam App (Android)

## Setup Development Environment

First, you should have `node` => v. 16.14.0 and `yarn` installed. To install all dependencies and stuff run:

```
yarn
```

## Run Emulator

React Native Metro

```
yarn android
```

If the emulator doesn't work properly:

1. Wipe data of the AVD emulator from the Android Studio AVD list
2. Run .\gradlew clean inside `android` directory
3. Fo back to the project directory and run `yarn android`

Expo

```
yarn expo:android
```

## Build

- `cd android`
- `./gradlew clean`
- Build the Bundle: `cd ..` then `react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res` It creates the `index.android.bundle` named bundle file in assets folder.
- Build the APK: `cd android` then `./gradlew assembleRelease -x bundleReleaseJsAndAssets` it will gives you the release **APK** at `android\app\build\outputs\apk\release` location.
- Build the AAB:`./gradlew bundleRelease -x bundleReleaseJsAndAssets` it will gives you the **AAB** file of your project.
