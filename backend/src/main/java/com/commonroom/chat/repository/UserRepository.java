package com.commonroom.chat.repository;

import com.commonroom.chat.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {

    private static final String COLLECTION_NAME = "users";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public User save(User user) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(user.getUid());
        docRef.set(user).get();
        return user;
    }

    public Optional<User> findById(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(uid);
        DocumentSnapshot snapshot = docRef.get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(User.class));
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) throws ExecutionException, InterruptedException {
        Query query = getCollection().whereEqualTo("email", email.toLowerCase().trim()).limit(1);
        QuerySnapshot querySnapshot = query.get().get();
        if (!querySnapshot.isEmpty()) {
            DocumentSnapshot snapshot = querySnapshot.getDocuments().get(0);
            return Optional.ofNullable(snapshot.toObject(User.class));
        }
        return Optional.empty();
    }

    public List<User> searchByNameOrEmail(String queryText) throws ExecutionException, InterruptedException {
        // Retrieve users and filter in memory or via prefix
        QuerySnapshot querySnapshot = getCollection().limit(50).get().get();
        List<User> results = new ArrayList<>();
        String lowerQuery = queryText.toLowerCase().trim();

        for (QueryDocumentSnapshot doc : querySnapshot) {
            User user = doc.toObject(User.class);
            if (user != null) {
                boolean matchesName = user.getDisplayName() != null && user.getDisplayName().toLowerCase().contains(lowerQuery);
                boolean matchesEmail = user.getEmail() != null && user.getEmail().toLowerCase().contains(lowerQuery);
                if (matchesName || matchesEmail) {
                    results.add(user);
                }
            }
        }
        return results;
    }

    public List<User> findAllByIds(List<String> uids) throws ExecutionException, InterruptedException {
        List<User> users = new ArrayList<>();
        if (uids == null || uids.isEmpty()) {
            return users;
        }
        for (String uid : uids) {
            findById(uid).ifPresent(users::add);
        }
        return users;
    }
}
