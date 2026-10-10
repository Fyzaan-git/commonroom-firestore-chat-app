package com.commonroom.chat.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.project-id:commonroom-chat-dev}")
    private String projectId;

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.emulator.enabled:true}")
    private boolean emulatorEnabled;

    @Value("${firebase.emulator.host:localhost:8085}")
    private String emulatorHost;

    @Bean
    public Firestore firestore() throws IOException {
        String envEmulatorHost = System.getenv("FIRESTORE_EMULATOR_HOST");
        if (envEmulatorHost == null && emulatorEnabled && emulatorHost != null && !emulatorHost.isBlank()) {
            System.setProperty("FIRESTORE_EMULATOR_HOST", emulatorHost);
            log.info("Configured Firestore Emulator host: {}", emulatorHost);
        }

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder()
                    .setProjectId(projectId);

            if (credentialsPath != null && !credentialsPath.isBlank()) {
                try (FileInputStream serviceAccount = new FileInputStream(credentialsPath)) {
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                    log.info("Loaded Firebase service account credentials from {}", credentialsPath);
                }
            } else {
                try {
                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                } catch (Exception e) {
                    log.warn("Application Default Credentials not found. Using anonymous/emulator credentials: {}", e.getMessage());
                }
            }

            FirebaseApp.initializeApp(optionsBuilder.build());
            log.info("Initialized FirebaseApp with project: {}", projectId);
        }

        FirestoreOptions.Builder firestoreOptions = FirestoreOptions.newBuilder()
                .setProjectId(projectId);

        if (System.getenv("FIRESTORE_EMULATOR_HOST") != null) {
            firestoreOptions.setEmulatorHost(System.getenv("FIRESTORE_EMULATOR_HOST"));
        }

        return firestoreOptions.build().getService();
    }
}
