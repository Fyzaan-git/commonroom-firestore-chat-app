package com.commonroom.chat.repository;

import com.commonroom.chat.model.WorkspaceMember;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class WorkspaceMemberRepository {

    private static final String COLLECTION_NAME = "workspaceMembers";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public WorkspaceMember save(WorkspaceMember member) throws ExecutionException, InterruptedException {
        String docId = member.getWorkspaceId() + "_" + member.getUserId();
        member.setId(docId);
        DocumentReference docRef = getCollection().document(docId);
        docRef.set(member).get();
        return member;
    }

    public Optional<WorkspaceMember> findByWorkspaceIdAndUserId(String workspaceId, String userId) throws ExecutionException, InterruptedException {
        String docId = workspaceId + "_" + userId;
        DocumentSnapshot snapshot = getCollection().document(docId).get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(WorkspaceMember.class));
        }
        return Optional.empty();
    }

    public List<WorkspaceMember> findByUserId(String userId) throws ExecutionException, InterruptedException {
        QuerySnapshot querySnapshot = getCollection().whereEqualTo("userId", userId).get().get();
        List<WorkspaceMember> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            list.add(doc.toObject(WorkspaceMember.class));
        }
        return list;
    }

    public List<WorkspaceMember> findByWorkspaceId(String workspaceId) throws ExecutionException, InterruptedException {
        QuerySnapshot querySnapshot = getCollection().whereEqualTo("workspaceId", workspaceId).get().get();
        List<WorkspaceMember> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : querySnapshot) {
            list.add(doc.toObject(WorkspaceMember.class));
        }
        return list;
    }

    public void delete(String workspaceId, String userId) throws ExecutionException, InterruptedException {
        String docId = workspaceId + "_" + userId;
        getCollection().document(docId).delete().get();
    }
}
