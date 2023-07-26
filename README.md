# Ehkam App (Android)

## Setup Development Environment

First, you should have `node` => v. 16.14.0 and `yarn` installed. To install all dependencies and stuff run:

```
yarn
```

## Run Emulator

**React Native Metro**

```
yarn android
```

If the emulator doesn't work properly, see the troubleshooting section below.

**Expo**

```
yarn expo:android
```

NOTE: Expo emulator is not working properly because some components like FastImaage doesn't support it, so use the React Native Metro instead.

## Build

1. `cd android`
2. Run `./gradlew clean`
3. Build the Bundle: Go back to the root direectory `cd ..` then `react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res` It creates the `index.android.bundle` named bundle file in assets folder.
4. Build the package:
   1. Option 1 (APK): `cd android` then `./gradlew assembleRelease -x bundleReleaseJsAndAssets` it will gives you the release **APK** at `android\app\build\outputs\apk\release` location.
   2. Option 1 (AAB): `cd android` then `./gradlew bundleRelease -x bundleReleaseJsAndAssets` it will gives you the **AAB** file of your project.

## Troubleshooting

If you face any issue while running the emulator or building the app, try the following:

1. Run `npm cache clean --force`
2. Run `git clean -fdx`
3. Back to the project root, and run `yarn`
4. `cd android` and run `./gradlew clean`
5. If the emulator doesn't work properly: Go to the AVD in the Android Studio and wipe the data of the emulator
6. Reboot the PC
7. Try to build now
