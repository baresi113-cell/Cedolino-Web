const fs = require("fs");
const f = "android/app/build.gradle";
let s = fs.readFileSync(f, "utf8");
const vc = process.env.VERSION_CODE || "1";
s = s.replace(/versionCode\s+\d+/, "versionCode " + vc).replace(/versionName\s+"[^"]*"/, 'versionName "1.0.' + vc + '"');
s = s.replace(/(buildTypes\s*\{\s*release\s*\{)/, "$1\n            signingConfig signingConfigs.release");
const sign = '    signingConfigs {\n        release {\n            storeFile file(System.getenv("KS_FILE"))\n            storePassword System.getenv("KS_PASS")\n            keyAlias "upload"\n            keyPassword System.getenv("KS_PASS")\n        }\n    }\n';
s = s.replace("buildTypes {", sign + "    buildTypes {");
if (!s.includes("signingConfig signingConfigs.release") || !s.includes('versionCode ' + vc)) throw new Error("patch-gradle: build.gradle non nel formato atteso");
fs.writeFileSync(f, s);
console.log("build.gradle aggiornato: versionCode " + vc + ", firma release attiva");

const mf = "android/app/src/main/AndroidManifest.xml";
let x = fs.readFileSync(mf, "utf8");
if (!x.includes("android.permission.USE_BIOMETRIC")) {
  x = x.replace(/<\/manifest>\s*$/, '    <uses-permission android:name="android.permission.USE_BIOMETRIC" />\n</manifest>\n');
  if (!x.includes("USE_BIOMETRIC")) throw new Error("patch-gradle: AndroidManifest.xml non nel formato atteso");
  fs.writeFileSync(mf, x);
}
console.log("AndroidManifest: permesso biometria presente");
