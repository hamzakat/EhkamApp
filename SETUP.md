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

1. `cd android`
2. Run `./gradlew clean`
3. Build the Bundle: `cd ..` then `react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res` It creates the `index.android.bundle` named bundle file in assets folder.
4. Build the package:
   1. Option 1 (APK): `cd android` then `./gradlew assembleRelease -x bundleReleaseJsAndAssets` it will gives you the release **APK** at `android\app\build\outputs\apk\release` location.
   2. Option 1 (AAB):`./gradlew bundleRelease -x bundleReleaseJsAndAssets` it will gives you the **AAB** file of your project.

## Troubleshooting

If you face any issue while running the emulator or building the app, try the following:

1. Run `npm cache clean --force`
2. Run `git clean -fdx`
3. `cd android` and run `./gradlew clean`
4. Back to the project root, and run `yarn`
5. Go to the AVD in the Android Studio and wipe the data of the emulator
6. Reboot the PC
7. Try to build now
