import JSZip from 'jszip';
import { FABRIC_TEMPLATES } from './templates';

export async function generateModZip(config: {
  modId: string;
  modName: string;
  modVersion: string;
  mavenGroup: string;
  description: string;
  extraFiles?: { path: string; content: string }[];
}) {
  const zip = new JSZip();
  const { modId, modName, modVersion, mavenGroup, description, extraFiles } = config;
  const packagePath = mavenGroup.replace(/\./g, '/') + '/' + modId;

  // Root files
  zip.file('build.gradle', FABRIC_TEMPLATES.buildGradle(modId, modVersion, mavenGroup));
  zip.file('gradle.properties', FABRIC_TEMPLATES.gradleProperties(modId));
  zip.file('settings.gradle', FABRIC_TEMPLATES.settingsGradle);
  zip.file('.gitignore', ".gradle\nbuild/\nbin/\n!gradle/wrapper/gradle-wrapper.jar\n.project\n.classpath\n.settings/\n.nb-gradle/\n.vscode/\nbin/\nout/\n.DS_Store\n*.swp\n*.iml\n*.ipr\n*.iws\n.idea/\n.gradle/\nbuild/\nrun/\n");

  // Gradle wrapper
  zip.file('gradle/wrapper/gradle-wrapper.properties', FABRIC_TEMPLATES.gradleWrapperProperties);

  // Resources
  zip.file('src/main/resources/fabric.mod.json', FABRIC_TEMPLATES.fabricModJson(modId, modName, description, mavenGroup));
  zip.file("src/main/resources/" + modId + ".mixins.json", FABRIC_TEMPLATES.mixinJson(modId, mavenGroup));

  // Java source
  const className = modName.replace(/\s+/g, '');
  zip.file("src/main/java/" + packagePath + "/" + className + ".java", FABRIC_TEMPLATES.mainClass(modId, modName, mavenGroup));
  zip.file("src/main/java/" + packagePath + "/mixin/ExampleMixin.java", FABRIC_TEMPLATES.mixinClass(modId, mavenGroup));

  // Extra files from AI
  if (extraFiles) {
    extraFiles.forEach(file => {
      zip.file(file.path, file.content);
    });
  }

  return await zip.generateAsync({ type: 'blob' });
}
