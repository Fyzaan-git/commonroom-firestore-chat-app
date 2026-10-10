package com.commonroom.chat.repository;

import com.commonroom.chat.model.Conversation;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class ConversationRepository {

    private static final String COLLECTION_NAME = "conversations";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public Conversation save(Conversation conversation) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(conversation.getConversationId());
        docRef.set(conversation).get();
        return conversation;
    }

    public Optional<Conversation> findById(String conversationId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(conversationId);
        DocumentSnapshot snapshot = docRef.get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(Conversation.class));
        }
        return Optional.empty();
    }

    public List<Conversation> findByWorkspaceAndParticipant(String workspaceId, String userId) throws ExecutionException, InterruptedException {
        Query query = getCollection()
                .whereEqualTo("workspaceId", workspaceId)
                .whereArrayContains("participantIds", userId);

        QuerySnapshot querySnapshot = query.get().get();
        List<Conversation> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            list.add(doc.toObject(Conversation.class));
        }
        // Sort by lastMessageAt descending
        list.sort((a, b) -> Long.compare(
                b.getLastMessageAt() != null ? b.getLastMessageAt() : 0L,
                a.getLastMessageAt() != null ? a.getLastMessageAt() : 0L
        ));
        return list;
    }

    public Optional<Conversation> findDirectConversation(String workspaceId, String user1, String user2) throws ExecutionException, InterruptedException {
        Query query = getCollection()
                .whereEqualTo("workspaceId", workspaceId)
                .whereEqualTo("type", "DIRECT")
                .whereArrayContains("participantIds", user1);

        QuerySnapshot querySnapshot = query.get().get();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            Conversation conv = doc.toObject(Conversation.class);
            if (conv != null && conv.getParticipantIds() != null && conv.getParticipantIds().contains(user2)) {
                return Optional.of(conv);
            }
        }
        return Optional.empty();
    }

    public void delete(String conversationId) throws ExecutionException, InterruptedException {
        getCollection().document(conversationId).delete().get();
    }
}
