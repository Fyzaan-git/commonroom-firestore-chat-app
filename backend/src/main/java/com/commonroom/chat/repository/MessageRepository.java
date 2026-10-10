package com.commonroom.chat.repository;

import com.commonroom.chat.model.Message;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class MessageRepository {

    private static final String COLLECTION_NAME = "messages";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public Message save(Message message) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(message.getMessageId());
        docRef.set(message).get();
        return message;
    }

    public Optional<Message> findById(String messageId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(messageId);
        DocumentSnapshot snapshot = docRef.get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(Message.class));
        }
        return Optional.empty();
    }

    public List<Message> findByConversationId(String conversationId, int limit, Long beforeTimestamp)
            throws ExecutionException, InterruptedException {
        Query query = getCollection()
                .whereEqualTo("conversationId", conversationId)
                .orderBy("createdAt", Query.Direction.DESCENDING);

        if (beforeTimestamp != null && beforeTimestamp > 0) {
            query = query.startAfter(beforeTimestamp);
        }

        query = query.limit(limit > 0 ? limit : 50);

        QuerySnapshot querySnapshot = query.get().get();
        List<Message> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            list.add(doc.toObject(Message.class));
        }

        // Return chronological order (oldest to newest for chat UI)
        list.sort((a, b) -> Long.compare(a.getCreatedAt(), b.getCreatedAt()));
        return list;
    }

    public List<Message> searchMessages(String conversationId, String queryText)
            throws ExecutionException, InterruptedException {
        Query query = getCollection()
                .whereEqualTo("conversationId", conversationId)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .limit(100);

        QuerySnapshot querySnapshot = query.get().get();
        List<Message> results = new ArrayList<>();
        String lower = queryText.toLowerCase().trim();

        for (QueryDocumentSnapshot doc : querySnapshot) {
            Message msg = doc.toObject(Message.class);
            if (msg != null && !Boolean.TRUE.equals(msg.getDeleted()) && msg.getText() != null && msg.getText().toLowerCase().contains(lower)) {
                results.add(msg);
            }
        }
        return results;
    }

    public void delete(String messageId) throws ExecutionException, InterruptedException {
        getCollection().document(messageId).delete().get();
    }
}
