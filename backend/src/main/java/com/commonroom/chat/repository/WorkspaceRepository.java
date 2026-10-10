package com.commonroom.chat.repository;

import com.commonroom.chat.model.Workspace;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class WorkspaceRepository {

    private static final String COLLECTION_NAME = "workspaces";

    @Autowired
    private Firestore firestore;

    private CollectionReference getCollection() {
        return firestore.collection(COLLECTION_NAME);
    }

    public Workspace save(Workspace workspace) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(workspace.getWorkspaceId());
        docRef.set(workspace).get();
        return workspace;
    }

    public Optional<Workspace> findById(String workspaceId) throws ExecutionException, InterruptedException {
        DocumentReference docRef = getCollection().document(workspaceId);
        DocumentSnapshot snapshot = docRef.get().get();
        if (snapshot.exists()) {
            return Optional.ofNullable(snapshot.toObject(Workspace.class));
        }
        return Optional.empty();
    }

    public List<Workspace> findAllByIds(List<String> workspaceIds) throws ExecutionException, InterruptedException {
        List<Workspace> list = new ArrayList<>();
        if (workspaceIds == null || workspaceIds.isEmpty()) {
            return list;
        }
        for (String id : workspaceIds) {
            findById(id).ifPresent(list::add);
        }
        return list;
    }
}
