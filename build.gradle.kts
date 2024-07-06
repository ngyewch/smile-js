plugins {
    application

    id("com.autonomousapps.dependency-analysis") version "1.32.0"
    id("com.diffplug.spotless") version "6.25.0"
    id("com.github.ben-manes.versions") version "0.51.0"
    id("se.ascp.gradle.gradle-versions-filter") version "0.1.16"
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("com.fasterxml.jackson:jackson-bom:2.17.2"))

    implementation("com.fasterxml.jackson.core:jackson-core")
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-smile")
    implementation("commons-codec:commons-codec:1.17.0")
    implementation("commons-io:commons-io:2.16.1")
    implementation("info.picocli:picocli:4.7.6")
    implementation("org.apache.commons:commons-text:1.12.0")
}

application {
    mainClass = "Main"
}

tasks {
    getByName<JavaExec>("run") {
        outputs.upToDateWhen { false }

        args("generateTestData", "src/test/data", "build/test/data/testData.ts")
    }

    register<Copy>("copyTestData") {
        outputs.upToDateWhen { false }

        dependsOn("run")

        from("build/test/data") {
            include("testData.ts")
            into("js")
        }

        from("build/test/data") {
            include("*.sml")
            into("data")
        }

        into("src/test")
    }
}

versionsFilter {
    gradleReleaseChannel.set("current")
    checkConstraints.set(true)
    outPutFormatter.set("json")
}

spotless {
    java {
        googleJavaFormat("1.22.0").reflowLongStrings().skipJavadocFormatting()
        formatAnnotations()
        targetExclude("build/**")
    }
}
