package com.example.cinema.;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.cinema.llm.ConversationContext;

import jakarta.servlet.http.HttpSession;

@Service
public class ConversationMemoryService {

    private HttpSession session;
    public ConversationMemoryService (HttpSession session){
        this.session = session;
    }
    private final Map<String, ConversationContext> store =
            new ConcurrentHashMap<>();

    public ConversationContext get(String key) {
        return store.computeIfAbsent(key, k -> new ConversationContext());
    }


    // Xóa state của 1 user
    public void clear(String key) {
        store.remove(key);
    }

    // Xóa toàn bộ state 
    public void clearAll() {
        store.clear();
    }
}
