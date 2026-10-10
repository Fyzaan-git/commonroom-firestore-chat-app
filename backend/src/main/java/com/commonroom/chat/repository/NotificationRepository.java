package com.commonroom.chat.repository;

import com.commonroom.chat.model.Notification;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class NotificationRepository {

    private static final String COLLECTION_NAME = "notifications";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public Notification save(Notification notification) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(notification.getNotificationId());
        docRef.set(notification).get();
        return notification;
    }

    public Optional<Notification> findById(String notificationId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(notificationId);
        DocumentSnapshot snapshot = docRef.get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(Notification.class));
        }
        return Optional.empty();
    }

    public List<Notification> findByRecipientId(String recipientId, int limit) throws ExecutionException, InterruptedException {
        Query query = getCollection()
                .whereEqualTo("recipientId", recipientId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(limit > 0 ? limit : 50);

        QuerySnapshot querySnapshot = query.get().get();
        List<Notification> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            list.add(doc.toObject(Notification.class));
        }
        return list;
    }

    public void markAsRead(String notificationId) throws ExecutionException, InterruptedException {
        getCollection().document(notificationId).update("isRead", true).get();
    }
}
